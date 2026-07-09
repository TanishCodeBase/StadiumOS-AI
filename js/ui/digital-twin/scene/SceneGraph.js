import { logger } from '../../../diagnostics/logger.js';

export class SceneGraph {
  constructor() {
    this.nodes = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    logger.info('System', 'SceneGraph: Spatial Scene Graph initialized successfully.');
  }

  clear() {
    this.nodes.clear();
    logger.debug('System', 'SceneGraph: Cleared all nodes.');
  }

  addNode(node) {
    if (!node || !node.id) {
      logger.warn('System', 'SceneGraph: Attempted to add invalid node.');
      return;
    }
    this.nodes.set(node.id, node);
  }

  removeNode(id) {
    this.nodes.delete(id);
  }

  updateNode(id, data) {
    const existing = this.nodes.get(id);
    if (existing) {
      // Merge updates
      const updated = existing.merge ? existing.merge(data) : Object.assign(existing, data);
      this.nodes.set(id, updated);
      return updated;
    }
    return null;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * Queries nodes satisfying filter criteria callback
   * @param {Function} filterCallback 
   * @returns {Array<SceneNode>}
   */
  query(filterCallback) {
    if (typeof filterCallback !== 'function') {
      return this.getNodes();
    }
    return this.getNodes().filter(filterCallback);
  }

  dispose() {
    this.clear();
    this.initialized = false;
    logger.info('System', 'SceneGraph: Disposed.');
  }
}

export const sceneGraph = new SceneGraph();
export default sceneGraph;
