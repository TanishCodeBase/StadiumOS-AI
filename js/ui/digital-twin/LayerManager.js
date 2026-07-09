export class LayerManager {
  constructor() {
    this.layers = {
      base: true,
      crowd: true,
      heatmap: true,
      transit: true,
      personnel: true,
      routes: true,
      cameras: true,
      incidents: true,
      labels: true,
      selection: true,
      debug: false
    };
    this.listeners = new Set();
  }

  /**
   * Toggles visibility status of a layer
   * @param {string} layerId 
   */
  toggle(layerId) {
    if (this.layers[layerId] !== undefined) {
      this.layers[layerId] = !this.layers[layerId];
      this.notify();
    }
  }

  setVisible(layerId, visible) {
    if (this.layers[layerId] !== undefined) {
      this.layers[layerId] = !!visible;
      this.notify();
    }
  }

  isVisible(layerId) {
    return !!this.layers[layerId];
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.layers);
      } catch (err) {
        console.error('LayerManager listener exception:', err);
      }
    });
  }
}
export const layerManager = new LayerManager();
export default LayerManager;
