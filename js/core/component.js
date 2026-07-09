import { reconcile, createDOM, unmount } from './renderer.js';
import { logger } from '../diagnostics/logger.js';

export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this._oldVNode = null;
    this.dom = null;
    this.placeholder = null;
    this._cleanups = [];
    this._pendingOnUpdate = false;
  }

  // Helper: Register a timeout timer
  addTimer(callback, delay) {
    const id = setTimeout(() => {
      // Filter out this timer from cleanups after running
      this._cleanups = this._cleanups.filter(c => c.id !== id);
      callback();
    }, delay);

    this._cleanups.push({
      type: 'timer',
      id,
      cleanup: () => clearTimeout(id)
    });
    return id;
  }

  // Helper: Register an interval timer
  addInterval(callback, delay) {
    const id = setInterval(callback, delay);

    this._cleanups.push({
      type: 'interval',
      id,
      cleanup: () => clearInterval(id)
    });
    return id;
  }

  // Helper: Register a DOM event listener
  addListener(target, type, listener, options) {
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(type, listener, options);
      this._cleanups.push({
        type: 'listener',
        cleanup: () => target.removeEventListener(type, listener)
      });
    } else {
      logger.warn('UI', `Component [${this.constructor.name}]: Cannot add listener, target is invalid`);
    }
  }

  // Helper: Register store or event bus subscription
  addSubscription(unsubscribeFn) {
    if (typeof unsubscribeFn === 'function') {
      this._cleanups.push({
        type: 'subscription',
        cleanup: unsubscribeFn
      });
    } else {
      logger.warn('UI', `Component [${this.constructor.name}]: Cannot add subscription, unsubscribe function is invalid`);
    }
  }

  // Helper: Register requestAnimationFrame loop
  addAnimationFrame(callback) {
    let id;
    const loop = (timestamp) => {
      callback(timestamp);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);

    this._cleanups.push({
      type: 'animationFrame',
      cleanup: () => cancelAnimationFrame(id)
    });
    return id;
  }

  // Helper: Register a custom cleanup function
  addCleanup(fn) {
    if (typeof fn === 'function') {
      this._cleanups.push({
        type: 'custom',
        cleanup: fn
      });
    }
  }

  /**
   * Mounts the component into a container DOM node
   * @param {HTMLElement} parentDOM 
   * @returns {HTMLElement} the created DOM element or placeholder
   */
  mount(parentDOM) {
    if (!parentDOM) {
      logger.error('UI', `Component [${this.constructor.name}]: Cannot mount, parentDOM is undefined`);
      return null;
    }

    this._oldVNode = this.render();
    const dom = reconcile(parentDOM, null, null, this._oldVNode);

    if (dom) {
      this.dom = dom;
      this.dom.__component = this;
      this.placeholder = null;
    } else {
      this.dom = null;
      const placeholder = document.createComment(`Component:${this.constructor.name}`);
      parentDOM.appendChild(placeholder);
      this.placeholder = placeholder;
    }

    this.onMount();
    return this.dom ?? this.placeholder;
  }

  /**
   * Performs virtual DOM reconciliation update for this component
   */
  update() {
    const currentDom = this.dom ?? this.placeholder;
    if (!currentDom || !currentDom.parentNode) {
      logger.warn('UI', `Component [${this.constructor.name}]: Cannot update, not currently mounted`);
      return;
    }

    const parentDOM = currentDom.parentNode;
    const newVNode = this.render();

    // ── Transition Case handling for self-driven updates ────────────────────
    if (this._oldVNode && !newVNode) {
      // 1. Real DOM → Placeholder
      const placeholder = document.createComment(`Component:${this.constructor.name}`);
      unmount(this._oldVNode);
      if (this.dom && this.dom.parentNode === parentDOM) {
        parentDOM.replaceChild(placeholder, this.dom);
      } else {
        parentDOM.appendChild(placeholder);
      }
      this.dom = null;
      this.placeholder = placeholder;
      this._oldVNode = null;
    } else if (!this._oldVNode && newVNode) {
      // 2. Placeholder → Real DOM
      const newDom = createDOM(newVNode);
      if (newDom) {
        if (this.placeholder && this.placeholder.parentNode === parentDOM) {
          parentDOM.replaceChild(newDom, this.placeholder);
        } else {
          parentDOM.appendChild(newDom);
        }
        newDom.__component = this;
      }
      this.dom = newDom;
      this.placeholder = null;
      this._oldVNode = newVNode;
    } else if (this._oldVNode && newVNode) {
      // 3. Real DOM → Real DOM (reconcile in-place)
      const updatedDom = reconcile(parentDOM, this.dom, this._oldVNode, newVNode);
      if (updatedDom) {
        this.dom = updatedDom;
        this.dom.__component = this;
        this._oldVNode = newVNode;
      }
    } else {
      // 4. Placeholder → Placeholder (no-op)
    }

    // Authoritative asynchronous lifecycle invocation with deduplication
    this._pendingOnUpdate = true;
    setTimeout(() => {
      if (this._pendingOnUpdate) {
        this._pendingOnUpdate = false;
        try {
          this.onUpdate();
        } catch (err) {
          logger.error('UI', `Component: Error in onUpdate hook for ${this.constructor.name}`, err);
        }
      }
    }, 0);
  }

  /**
   * Merge partial state and trigger a rerender.
   */
  setState(partialState = {}) {
    if (partialState && typeof partialState === 'object') {
      this.state = {
        ...this.state,
        ...partialState
      };
    }

    // If already mounted, rerender.
    if (this.dom || this.placeholder) {
      this.update();
    }
  }

  /**
   * Unmounts component, executes all registered cleanups, and notifies hook.
   */
  destroy() {
    this.onDestroy();

    this._cleanups.forEach(c => {
      try {
        c.cleanup();
      } catch (err) {
        logger.error('UI', `Component [${this.constructor.name}]: Error running cleanup of type ${c.type}`, err);
      }
    });

    this._cleanups = [];

    // DO NOT REMOVE DOM HERE

    this.dom = null;
    this.placeholder = null;
    this._oldVNode = null;
  }

  // Lifecycle hooks (override in subclasses)
  onMount() { }
  onUpdate() { }
  onDestroy() { }

  /**
   * Renders the component. Subclasses must implement this method.
   * @returns {object} Virtual DOM element
   */
  render() {
    throw new Error('Component subclasses must implement render()');
  }
}
