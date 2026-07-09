export class SceneNode {
  constructor({ id, type, position, bounds, visible = true, selected = false, hovered = false, metadata = {} }) {
    this.id = id;
    this.type = type;
    this.position = position || { x: 0, y: 0 };
    this.bounds = bounds || { x: this.position.x, y: this.position.y, width: 0, height: 0 };
    this.visible = !!visible;
    this.selected = !!selected;
    this.hovered = !!hovered;
    this.metadata = metadata || {};
  }

  /**
   * Deep freezes the SceneNode to guarantee immutability.
   * @returns {SceneNode}
   */
  freeze() {
    const deepFreeze = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        const val = obj[prop];
        if (val && typeof val === 'object') {
          deepFreeze(val);
        }
      });
      return obj;
    };
    return deepFreeze(this);
  }

  /**
   * Clones this SceneNode instance.
   * @returns {SceneNode}
   */
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this, {
      position: { ...this.position },
      bounds: { ...this.bounds },
      metadata: { ...this.metadata }
    });
    return cloned;
  }
}
export default SceneNode;
