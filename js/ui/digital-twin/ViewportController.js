export class ViewportController {
  constructor(coordinateSystem, onUpdate) {
    this.coords = coordinateSystem;
    this.onUpdate = onUpdate;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
  }

  /**
   * Binds zoom and pan interaction handlers to the viewport SVG element
   * @param {SVGElement} container 
   */
  bindEvents(container) {
    if (!container) return;

    container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    container.addEventListener('mouseup', () => this.handleMouseUp());
    container.addEventListener('mouseleave', () => this.handleMouseUp());
    container.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
  }

  handleMouseDown(e) {
    // Check if dragging with left mouse button (button code 0)
    if (e.button !== 0) return;
    this.isPanning = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isPanning) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    this.startX = e.clientX;
    this.startY = e.clientY;

    this.coords.pan(dx, dy);
    this.onUpdate();
  }

  handleMouseUp() {
    this.isPanning = false;
  }

  handleWheel(e) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    this.coords.zoom(factor, x, y);
    this.onUpdate();
  }
}
export default ViewportController;
