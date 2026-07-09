import { SceneNode } from './SceneNode.js';

export class SceneGroup extends SceneNode {
  constructor(props = {}) {
    super({ ...props, type: 'GROUP' });
    this.children = new Map();
  }

  addChild(node) {
    if (node && node.id) {
      this.children.set(node.id, node);
    }
  }

  removeChild(id) {
    this.children.delete(id);
  }

  getChild(id) {
    return this.children.get(id);
  }

  getChildren() {
    return Array.from(this.children.values());
  }

  clear() {
    this.children.clear();
  }
}
export default SceneGroup;
