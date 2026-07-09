export class CoordinateSystem {
  constructor(worldWidth = 600, worldHeight = 500) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.scale = 1.0;
    this.translateX = 0;
    this.translateY = 0;
    this.viewportWidth = worldWidth;
    this.viewportHeight = worldHeight;
  }

  setViewportSize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Transforms world coordinates to screen coordinate space.
   * @param {number} wx 
   * @param {number} wy 
   * @returns {{x: number, y: number}}
   */
  worldToScreen(wx, wy) {
    const sx = wx * this.scale + this.translateX;
    const sy = wy * this.scale + this.translateY;
    return { x: sx, y: sy };
  }

  /**
   * Transforms screen coordinates back to world coordinate space.
   * @param {number} sx 
   * @param {number} sy 
   * @returns {{x: number, y: number}}
   */
  screenToWorld(sx, sy) {
    const wx = (sx - this.translateX) / this.scale;
    const wy = (sy - this.translateY) / this.scale;
    return { x: wx, y: wy };
  }

  /**
   * Pans viewport offset.
   * @param {number} dx 
   * @param {number} dy 
   */
  pan(dx, dy) {
    this.translateX += dx;
    this.translateY += dy;
  }

  /**
   * Zooms viewport scale relative to a specific center point.
   * @param {number} factor multiplier
   * @param {number} centerX focal point X coordinate
   * @param {number} centerY focal point Y coordinate
   */
  zoom(factor, centerX, centerY) {
    const prevScale = this.scale;
    // Constrain scale factor bounds between 0.1x and 12.0x
    this.scale = Math.max(0.1, Math.min(12.0, this.scale * factor));
    
    this.translateX = centerX - (centerX - this.translateX) * (this.scale / prevScale);
    this.translateY = centerY - (centerY - this.translateY) * (this.scale / prevScale);
  }

  /**
   * Resets scales and centers stadium inside viewport bounds.
   * @param {number} vWidth 
   * @param {number} vHeight 
   */
  fitToViewport(vWidth, vHeight) {
    this.setViewportSize(vWidth, vHeight);
    
    const scaleX = vWidth / this.worldWidth;
    const scaleY = vHeight / this.worldHeight;
    this.scale = Math.min(scaleX, scaleY) * 0.96; // preserve 4% safety buffer margin
    
    this.translateX = (vWidth - this.worldWidth * this.scale) / 2;
    this.translateY = (vHeight - this.worldHeight * this.scale) / 2;
  }
}
export default CoordinateSystem;
