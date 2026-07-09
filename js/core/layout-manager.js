import { logger } from '../diagnostics/logger.js';

const LAYOUTS = {
  default: {
    'digital-twin': { className: 'grid-digital-twin', visible: true },
    'ai-recommendations': { className: 'grid-ai-recommendations', visible: true },
    'incidents': { className: 'grid-incidents', visible: true },
    'transport': { className: 'grid-transport', visible: true },
    'timeline': { className: 'grid-timeline', visible: true },
    'health': { className: 'grid-health', visible: true },
    'emergency': { className: 'grid-emergency', visible: true },
    'volunteers': { className: 'grid-volunteers', visible: true },
    'system-status': { className: 'grid-system-status', visible: true },
    'layer-controls': { className: 'grid-layer-controls', visible: true },
    'ai-explanation': { className: 'grid-ai-explanation', visible: true }
  },
  compact: {
    'digital-twin': { className: '', style: 'grid-column: span 8; grid-row: span 8;', visible: true },
    'ai-recommendations': { className: '', style: 'grid-column: span 4; grid-row: span 3;', visible: true },
    'incidents': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'transport': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'timeline': { className: '', style: 'grid-column: span 4; grid-row: span 3;', visible: true },
    'health': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'emergency': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'volunteers': { className: '', style: 'grid-column: span 8; grid-row: span 3;', visible: true },
    'system-status': { className: '', style: 'grid-column: span 4; grid-row: span 3;', visible: true },
    'layer-controls': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'ai-explanation': { className: '', style: 'grid-column: span 4; grid-row: span 3;', visible: true }
  },
  emergency: {
    'digital-twin': { className: '', style: 'grid-column: span 8; grid-row: span 8;', visible: true },
    'emergency': { className: '', style: 'grid-column: span 4; grid-row: span 4;', visible: true },
    'incidents': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'ai-recommendations': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'transport': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'timeline': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'health': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'volunteers': { className: '', style: 'grid-column: span 8; grid-row: span 2;', visible: true },
    'system-status': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'layer-controls': { className: '', style: 'grid-column: span 4; grid-row: span 2;', visible: true },
    'ai-explanation': { className: '', style: 'grid-column: span 4; grid-row: span 3;', visible: true }
  },
  fullscreen: {
    'digital-twin': { className: '', style: 'grid-column: span 12; grid-row: span 8;', visible: true },
    'ai-recommendations': { className: '', visible: false },
    'incidents': { className: '', visible: false },
    'transport': { className: '', visible: false },
    'timeline': { className: '', visible: false },
    'health': { className: '', visible: false },
    'emergency': { className: '', visible: false },
    'volunteers': { className: '', visible: false },
    'system-status': { className: '', visible: false },
    'layer-controls': { className: '', visible: false },
    'ai-explanation': { className: '', visible: false }
  }
};

class LayoutManager {
  constructor() {
    this.currentLayout = 'default';
    this.listeners = new Set();
  }

  /**
   * Set active named layout
   * @param {string} name 'default' | 'compact' | 'emergency' | 'fullscreen'
   */
  setLayout(name) {
    if (!LAYOUTS[name]) {
      logger.error('System', `LayoutManager: Layout '${name}' is invalid`);
      return;
    }

    if (this.currentLayout === name) return;

    const previousLayout = this.currentLayout;
    this.currentLayout = name;
    logger.info('System', `LayoutManager: Changed layout from '${previousLayout}' to '${name}'`);

    // Notify all subscribers
    for (const callback of this.listeners) {
      try {
        callback(name, previousLayout);
      } catch (err) {
        logger.error('System', 'LayoutManager: Error in layout listener callback', err);
      }
    }
  }

  /**
   * Retrieve active layout name
   * @returns {string}
   */
  getCurrentLayout() {
    return this.currentLayout;
  }

  /**
   * Get placement styling configuration for a panel
   * @param {string} id panel ID
   * @returns {object} { className, style, visible }
   */
  getPanelPlacement(id) {
    const layoutConfig = LAYOUTS[this.currentLayout];
    const placement = layoutConfig ? layoutConfig[id] : null;

    if (!placement) {
      // Fallback configuration if panel doesn't have mapping in a custom layout
      return {
        className: '',
        style: 'grid-column: span 3; grid-row: span 2;',
        visible: true
      };
    }

    return {
      className: placement.className || '',
      style: placement.style || '',
      visible: placement.visible !== undefined ? placement.visible : true
    };
  }

  /**
   * Subscribe to layout changes
   * @param {Function} callback (currentLayout, previousLayout) => void
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const layoutManager = new LayoutManager();
export default layoutManager;
