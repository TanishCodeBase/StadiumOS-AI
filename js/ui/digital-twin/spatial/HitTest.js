export class HitTest {
  constructor(spatialIndex) {
    this.index = spatialIndex;
  }

  /**
   * Resolves the closest SceneNode containing a world coordinate point
   * @param {{x: number, y: number}} point 
   * @returns {SceneNode|null}
   */
  findAtPoint(point) {
    if (!point) return null;
    
    // Create bounds query representing coordinate cursor width
    const bounds = { x: point.x - 2, y: point.y - 2, width: 4, height: 4 };
    const candidates = this.index.query(bounds);
    
    let closest = null;
    let minDistance = Infinity;

    candidates.forEach(node => {
      if (this._containsPoint(node.bounds, point)) {
        const dx = node.position.x - point.x;
        const dy = node.position.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closest = node;
        }
      }
    });

    return closest;
  }

  /**
   * Queries list of SceneNodes intersecting rectangular boundary parameters
   * @param {{x: number, y: number, width: number, height: number}} rect 
   * @returns {Array<SceneNode>}
   */
  findInRect(rect) {
    if (!rect) return [];
    return this.index.query(rect);
  }

  _containsPoint(bounds, pt) {
    return (
      pt.x >= bounds.x &&
      pt.x <= bounds.x + bounds.width &&
      pt.y >= bounds.y &&
      pt.y <= bounds.y + bounds.height
    );
  }
}
export default HitTest;
