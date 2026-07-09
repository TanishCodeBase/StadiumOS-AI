import { logger } from '../diagnostics/logger.js';

const DIAG_ENABLED  = false;
let _reconcileDepth = 0;

const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'text', 'tspan',
  'polygon', 'polyline', 'marker', 'defs', 'mask', 'use',
  'linearGradient', 'radialGradient', 'stop'
]);

const SVG_ATTR_MAP = {
  strokeWidth: 'stroke-width',
  strokeDasharray: 'stroke-dasharray',
  strokeLinecap: 'stroke-linecap',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity'
};

function _tag(vnode) {
  if (!vnode) return 'NULL';
  if (typeof vnode.tag === 'function') return vnode.tag.name || 'AnonymousComponent';
  return vnode.tag || '?';
}

function _domDesc(dom) {
  if (!dom) return 'NULL';
  if (dom.nodeType === 8) return `<!--${dom.nodeValue}-->`;
  if (dom.nodeType === 3) return `#text("${(dom.nodeValue || '').slice(0, 20)}")`;
  if (dom.tagName) return `<${dom.tagName.toLowerCase()}>`;
  return '[node]';
}

function _compName(instance) {
  return instance?.constructor?.name || 'Unknown';
}

function _diag(label, fields) {
  if (!DIAG_ENABLED) return;
  const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(' | ');
  console.log(`[RENDERER] ${label} — ${parts}`);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a real DOM node from a Virtual DOM node.
 *
 * When a component's render() returns null, an invisible comment placeholder
 * is created and returned instead. This keeps the parent's real DOM childNodes
 * indices aligned 1:1 with the VDOM children array, preventing index-shift
 * errors during reconciliation.
 *
 * @param {object} vnode
 * @returns {Node}
 */
export function createDOM(vnode) {
  if (!vnode) return null;

  // ── Handle Component elements ─────────────────────────────────────────────
  if (typeof vnode.tag === 'function') {
    const instance = new vnode.tag(vnode.props);
    vnode.instance = instance;
    instance.props = {
      ...(vnode.props || {}),
      children: vnode.children || []
    };

    // Always initialize placeholder to null; set below if render() returns null.
    instance.placeholder = null;

    const subVNode = instance.render();
    instance._oldVNode = subVNode;
    const dom = createDOM(subVNode);
    instance.dom = dom;

    // ── Placeholder logic ────────────────────────────────────────────────────
    // If the component rendered null, create an invisible comment node so that
    // the parent's childNodes array has a slot for this component. Without this,
    // every subsequent sibling's real DOM index would be off by one from its
    // VDOM index, causing null DOM references during the next reconcile pass.
    let mountNode;
    if (dom) {
      dom.__component = instance;
      mountNode = dom;
    } else {
      const placeholder = document.createComment(`Component:${instance.constructor.name}`);
      instance.placeholder = placeholder;
      mountNode = placeholder;
    }

    _diag('CREATE_DOM:Component', {
      component: _compName(instance),
      subVNodeTag: _tag(subVNode),
      dom: _domDesc(dom),
      mountNode: dom ? _domDesc(dom) : `<!--${_compName(instance)}-->`
    });

    // Call mount lifecycle hook asynchronously after DOM is fully created.
    setTimeout(() => {
      try {
        instance.onMount();
      } catch (err) {
        logger.error('UI', `Renderer: Error in onMount hook for ${instance.constructor.name}`, err);
      }
    }, 0);

    return mountNode;
  }

  // ── Text nodes ────────────────────────────────────────────────────────────
  if (vnode.tag === 'TEXT_ELEMENT') {
    return document.createTextNode(vnode.props.nodeValue || '');
  }

  // ── Element nodes ─────────────────────────────────────────────────────────
  const isSvg = SVG_TAGS.has(vnode.tag);
  const dom = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag);

  updateDOMProperties(dom, {}, vnode.props);

  vnode.children.forEach(child => {
    const childDom = createDOM(child);
    if (childDom) {
      dom.appendChild(childDom);
    }
  });

  return dom;
}

/**
 * Recursively unmounts virtual DOM nodes, calling destroy lifecycle hooks
 * for Components and removing any active placeholder comment nodes.
 *
 * @param {object} vnode
 */
export function unmount(vnode) {
  if (!vnode) return;

  if (vnode.instance && typeof vnode.instance.destroy === 'function') {
    const instance = vnode.instance;

    // Remove placeholder from DOM if the component is currently in null-render state.
    if (instance.placeholder && instance.placeholder.parentNode) {
      instance.placeholder.parentNode.removeChild(instance.placeholder);
    }
    instance.placeholder = null;

    vnode.instance.destroy();
  } else {
    // Recursively unmount child trees to ensure nested components are cleaned.
    if (vnode.children) {
      vnode.children.forEach(unmount);
    }
  }
}

/**
 * Syncs attributes, styles, and event listeners between old and new properties.
 *
 * @param {HTMLElement} dom
 * @param {object} oldProps
 * @param {object} newProps
 */
export function updateDOMProperties(dom, oldProps, newProps) {
  if (!dom) {
    console.error('DOM IS UNDEFINED');
    console.log('oldProps =', oldProps);
    console.log('newProps =', newProps);
    console.trace();
    return;
  }

  // 1. Remove old event listeners (only if changed or removed)
  Object.keys(oldProps)
    .filter(name => name.startsWith('on') && (!(name in newProps) || oldProps[name] !== newProps[name]))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, oldProps[name]);
    });

  // 2. Remove old properties and classes (only if not present in newProps)
  Object.keys(oldProps)
    .filter(name => !name.startsWith('on') && name !== 'children' && !(name in newProps))
    .forEach(name => {
      let attrName = name;
      if (SVG_ATTR_MAP[name]) {
        attrName = SVG_ATTR_MAP[name];
      }

      if (attrName === 'className') {
        dom.removeAttribute('class');
      } else {
        dom.removeAttribute(attrName);
      }
    });

  // 3. Add new event listeners (only if new or changed)
  Object.keys(newProps)
    .filter(name => name.startsWith('on') && (!(name in oldProps) || oldProps[name] !== newProps[name]))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, newProps[name]);
    });

  // 4. Add new properties, styling, and classes (only if new or changed)
  Object.keys(newProps)
    .filter(name => !name.startsWith('on') && name !== 'children' && newProps[name] !== oldProps[name])
    .forEach(name => {
      let attrName = name;
      if (SVG_ATTR_MAP[name]) {
        attrName = SVG_ATTR_MAP[name];
      }

      if (attrName === 'className') {
        dom.setAttribute('class', newProps.className);
      } else if (attrName === 'style') {
        if (typeof newProps.style === 'object') {
          dom.removeAttribute('style');
          Object.assign(dom.style, newProps.style);
        } else {
          dom.setAttribute('style', newProps.style);
        }
      } else if (attrName === 'nodeValue') {
        // Handled separately for text nodes — prevent setting as attribute.
      } else {
        dom.setAttribute(attrName, newProps[name]);
      }
    });
}

/**
 * Reconciles/diffs the real DOM tree with the new Virtual DOM representation.
 *
 * Placeholder-aware component reconciliation supports four transition cases:
 *
 *   Case 2: placeholder  → real DOM   (component begins rendering)
 *   Case 3: real DOM     → placeholder (component renders null again)
 *   Case 4: placeholder  → placeholder (component stays null — no DOM change)
 *   Case 5: real DOM     → real DOM   (normal update, unchanged architecture)
 *
 * @param {HTMLElement} parentDOM
 * @param {HTMLElement} dom        The real DOM node at this position (may be a comment placeholder).
 * @param {object}      oldVNode
 * @param {object}      newVNode
 * @returns {Node} updated DOM node (element or comment placeholder)
 */
export function reconcile(parentDOM, dom, oldVNode, newVNode) {
  // Track whether this is a top-level entry (depth 0 → 1 means new chain).
  // component.update() always enters reconcile at depth 0, so the first
  // increment below will bring depth to 1 — identical to parent-driven calls.
  // We cannot distinguish them at this boundary; _reconcilePhase must be set
  // by the CALLER (component.update()) before calling reconcile().
  _reconcileDepth++;
  const depth = _reconcileDepth;

  _diag('RECONCILE:enter', {
    depth,
    tag:     _tag(newVNode) || _tag(oldVNode),
    dom:     _domDesc(dom),
    parent:  _domDesc(parentDOM),
    oldVNode: _tag(oldVNode),
    newVNode: _tag(newVNode)
  });

  // Helper: log return reasons cleanly when diagnostics are on.
  const _ret = (reason, value) => {
    _diag('RECONCILE:return', { depth, reason, returned: _domDesc(value) });
    _reconcileDepth--;
    return value;
  };

  if (!parentDOM) {
    logger.error('UI', 'Renderer: Reconcile error, parentDOM is undefined');
    _reconcileDepth--;
    return null;
  }

  // ── 1. No old node: create and append ────────────────────────────────────
  if (!oldVNode) {
    const newDom = createDOM(newVNode);
    if (newDom) parentDOM.appendChild(newDom);
    return _ret('CREATE_NODE', newDom);
  }

  // ── 2. No new node: remove old node and trigger cleanups ─────────────────
  if (!newVNode) {
    if (dom) {
      unmount(oldVNode);
      if (dom.parentNode === parentDOM) {
        parentDOM.removeChild(dom);
      }
    }
    return _ret('REMOVE_NODE', null);
  }

  // ── Component tag reconciliation ─────────────────────────────────────────
  const oldIsComp = typeof oldVNode.tag === 'function';
  const newIsComp = typeof newVNode.tag === 'function';

  if (oldIsComp || newIsComp) {

    // Different component types: replace entirely.
    if (oldVNode.tag !== newVNode.tag) {
      const newDom = createDOM(newVNode);
      if (dom && newDom) {
        unmount(oldVNode);
        parentDOM.replaceChild(newDom, dom);
      }
      return _ret('REPLACE_NODE', newDom);
    }

    // ── Same component type: reuse instance ──────────────────────────────────
    const instance = oldVNode.instance;
    newVNode.instance = instance;
    instance.props = { ...newVNode.props, children: newVNode.children };

    const oldSubVNode = instance._oldVNode;
    const newSubVNode = instance.render();

    // Commit the new sub-vnode reference immediately so any reentrant render
    // call sees a consistent _oldVNode before the DOM transitions below.
    instance._oldVNode = newSubVNode;

    _diag('RECONCILE:component', {
      depth,
      component:          _compName(instance),
      oldSubTag:          _tag(oldSubVNode),
      newSubTag:          _tag(newSubVNode),
      'instance.dom':     _domDesc(instance.dom),
      'placeholder':      instance.placeholder ? `<!--${_compName(instance)}-->` : 'none',
      domPassedIn:        _domDesc(dom)
    });

    const oldIsNull = !oldSubVNode;
    const newIsNull = !newSubVNode;
    let updatedDom;

    if (oldIsNull && newIsNull) {
      // ── Case 4: placeholder → placeholder ──────────────────────────────────
      // The component is still rendering null. Keep the existing comment node.
      // Do NOT call the recursive reconcile — it would trigger the REMOVE_NODE
      // path and delete the placeholder from the DOM.
      updatedDom = dom;
      _diag('RECONCILE:component:case4-placeholder-keep', {
        depth, component: _compName(instance), placeholder: _domDesc(dom)
      });

    } else if (oldIsNull && !newIsNull) {
      // ── Case 2: placeholder → real DOM ─────────────────────────────────────
      // The component is now rendering real content. Build the DOM subtree and
      // replace the comment placeholder with it.
      const newRealDom = createDOM(newSubVNode);
      if (newRealDom) {
        if (dom && dom.parentNode === parentDOM) {
          parentDOM.replaceChild(newRealDom, dom);
        } else {
          parentDOM.appendChild(newRealDom);
        }
        newRealDom.__component = instance;
      }
      instance.placeholder = null;
      updatedDom = newRealDom;
      _diag('RECONCILE:component:case2-placeholder-to-real', {
        depth, component: _compName(instance), newDom: _domDesc(newRealDom)
      });

    } else if (!oldIsNull && newIsNull) {
      // ── Case 3: real DOM → placeholder ─────────────────────────────────────
      // The component is now rendering null. Replace its real DOM subtree with
      // an invisible comment placeholder so the parent's childNodes index stays
      // aligned with the VDOM children array.
      const placeholder = document.createComment(`Component:${instance.constructor.name}`);
      unmount(oldSubVNode);
      if (dom && dom.parentNode === parentDOM) {
        parentDOM.replaceChild(placeholder, dom);
      } else {
        // dom may already be detached (e.g. a prior self-driven update removed
        // it). Append the placeholder so the index is always represented.
        parentDOM.appendChild(placeholder);
      }
      instance.placeholder = placeholder;
      updatedDom = placeholder;
      _diag('RECONCILE:component:case3-real-to-placeholder', {
        depth, component: _compName(instance)
      });

    } else {
      // ── Case 5: real DOM → real DOM (normal update) ────────────────────────
      // Both old and new sub-VNodes exist. Diff recursively as before.
      updatedDom = reconcile(parentDOM, dom, oldSubVNode, newSubVNode);
      if (updatedDom) updatedDom.__component = instance;
      _diag('RECONCILE:component:case5-real-to-real', {
        depth, component: _compName(instance), updatedDom: _domDesc(updatedDom)
      });
    }

    // Update the instance DOM reference.
    // If the component is now in placeholder state, dom = null.
    instance.dom = newIsNull ? null : updatedDom;

    // Call update lifecycle hook asynchronously.
    instance._pendingOnUpdate = true;
    setTimeout(() => {
      if (instance._pendingOnUpdate) {
        instance._pendingOnUpdate = false;
        try {
          instance.onUpdate();
        } catch (err) {
          logger.error('UI', `Renderer: Error in onUpdate hook for ${instance.constructor.name}`, err);
        }
      }
    }, 0);

    return _ret('COMPONENT_NODE', updatedDom);
  }

  // ── 3. Element tag type changed: replace completely ───────────────────────
  if (oldVNode.tag !== newVNode.tag) {
    const newDom = createDOM(newVNode);
    if (dom && newDom) {
      unmount(oldVNode);
      parentDOM.replaceChild(newDom, dom);
    }
    return _ret('REPLACE_NODE', newDom);
  }

  // ── 4. Text node: compare value and update ────────────────────────────────
  if (newVNode.tag === 'TEXT_ELEMENT') {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      dom.nodeValue = newVNode.props.nodeValue;
    }
    return _ret('TEXT_NODE', dom);
  }

  // ── 5. Defensive DOM guard before property sync ───────────────────────────
  // At this point dom must be a real element. A null here indicates a VDOM/DOM
  // index mismatch which the placeholder system should have eliminated. Log and
  // bail rather than crashing with a property-access exception.
  if (!dom) {
    logger.error('Renderer', 'updateDOMProperties called with null DOM', { oldVNode, newVNode });
    _reconcileDepth--;
    return null;
  }

  // ── 6. Sync changed properties ────────────────────────────────────────────
  updateDOMProperties(dom, oldVNode.props, newVNode.props);

  // ── 7. Diff children ──────────────────────────────────────────────────────
  // Snapshot childNodes into a static array BEFORE the loop begins.
  // dom.childNodes is a live NodeList — any removeChild/replaceChild call
  // shifts indices, causing stale DOM references on subsequent iterations.
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  const childNodes = Array.from(dom.childNodes);

  _diag('RECONCILE:children', {
    depth,
    parentTag:      _tag(newVNode),
    vdomChildren:   newChildren.length,
    realChildren:   childNodes.length,
    mismatch:       childNodes.length !== oldChildren.length ? 'YES ⚠' : 'no'
  });

  for (let i = 0; i < maxLen; i++) {
    reconcile(
      dom,
      childNodes[i] || null,
      oldChildren[i] || null,
      newChildren[i] || null
    );
  }

  return _ret('UPDATE_NODE', dom);
}
