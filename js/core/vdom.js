/**
 * StadiumOS AI - Custom Hyperscript (Virtual DOM builder)
 */
export function h(tag, props, ...children) {
  props = props || {};
  
  // Flatten and filter children (remove null, undefined, false)
  const flatChildren = children
    .flat(Infinity)
    .filter(c => c !== null && c !== undefined && c !== false)
    .map(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        return {
          tag: 'TEXT_ELEMENT',
          props: { nodeValue: String(c) },
          children: []
        };
      }
      return c;
    });

  return {
    tag,
    props,
    children: flatChildren
  };
}
