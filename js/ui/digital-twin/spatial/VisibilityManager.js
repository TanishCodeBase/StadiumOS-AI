export class VisibilityManager {
  constructor(layerManager) {
    this.layerManager = layerManager;
  }

  /**
   * Asserts if a SceneNode is visible and within the frustum bounds
   * @param {SceneNode} node 
   * @param {ViewFrustum} [viewportFrustum] 
   * @returns {boolean}
   */
  isVisible(node, viewportFrustum) {
    if (!node) return false;
    if (!node.visible) return false;

    // Map node category types to LayerManager toggling keys
    if (this.layerManager) {
      const layerKey = this._mapNodeTypeToLayer(node.type);
      if (layerKey && !this.layerManager.isVisible(layerKey)) {
        return false;
      }
    }

    // View frustum boundaries clip test
    if (viewportFrustum && typeof viewportFrustum.contains === 'function') {
      return viewportFrustum.contains(node.bounds);
    }

    return true;
  }

  /**
   * Filters list of SceneNodes returning only active visible nodes
   * @param {Array<SceneNode>} nodes 
   * @param {ViewFrustum} [viewportFrustum] 
   * @returns {Array<SceneNode>}
   */
  filter(nodes, viewportFrustum) {
    if (!Array.isArray(nodes)) return [];
    return nodes.filter(node => this.isVisible(node, viewportFrustum));
  }

  _mapNodeTypeToLayer(type) {
    switch (type) {
      case 'CROWD': return 'base';
      case 'RESPONDER': return 'personnel';
      case 'VOLUNTEER': return 'personnel';
      case 'TRANSIT': return 'transit';
      case 'ROUTE': return 'routes';
      case 'GATE': return 'base';
      case 'CAMERA': return 'base';
      case 'HEAT': return 'heatmap';
      case 'INCIDENT': return 'incidents';
      default: return null;
    }
  }
}
export default VisibilityManager;
