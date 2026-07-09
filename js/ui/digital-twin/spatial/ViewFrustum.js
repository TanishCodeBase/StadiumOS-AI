export class ViewFrustum {
  constructor(coordinateSystem) {
    this.coords = coordinateSystem;
  }

  /**
   * Computes the current visible viewport boundary in world coordinate space
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getBounds() {
    const tl = this.coords.screenToWorld(0, 0);
    const br = this.coords.screenToWorld(this.coords.viewportWidth, this.coords.viewportHeight);

    return {
      x: Math.min(tl.x, br.x),
      y: Math.min(tl.y, br.y),
      width: Math.abs(br.x - tl.x),
      height: Math.abs(br.y - tl.y)
    };
  }

  /**
   * Asserts whether a world space bounding box overlaps the active frustum bounds
   * @param {{x: number, y: number, width: number, height: number}} bounds 
   * @returns {boolean}
   */
  contains(bounds) {
    if (!bounds) return false;
    const frustum = this.getBounds();
    
    return (
      bounds.x < frustum.x + frustum.width &&
      bounds.x + bounds.width > frustum.x &&
      bounds.y < frustum.y + frustum.height &&
      bounds.y + bounds.height > frustum.y
    );
  }
}
export default ViewFrustum;
