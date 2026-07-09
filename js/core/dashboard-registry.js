import { logger } from '../diagnostics/logger.js';

class DashboardRegistry {
  constructor() {
    this.panels = new Map();
  }

  /**
   * Register a new dashboard panel metadata
   * @param {object} metadata panel metadata configurations
   */
  register(metadata) {
    const { id, title, component } = metadata;
    
    if (!id || typeof id !== 'string') {
      logger.error('System', 'DashboardRegistry: Registration failed, invalid id provided.');
      return;
    }
    
    if (!title || typeof title !== 'string') {
      logger.error('System', `DashboardRegistry: Registration failed for '${id}', invalid title.`);
      return;
    }

    if (typeof component !== 'function') {
      logger.error('System', `DashboardRegistry: Registration failed for '${id}', component must be a Class/Function.`);
      return;
    }

    const panelConfig = {
      id,
      title,
      component,
      area: metadata.area || 'main',
      order: typeof metadata.order === 'number' ? metadata.order : 99,
      minWidth: typeof metadata.minWidth === 'number' ? metadata.minWidth : 1,
      minHeight: typeof metadata.minHeight === 'number' ? metadata.minHeight : 1,
      resizable: metadata.resizable !== undefined ? !!metadata.resizable : false,
      visible: metadata.visible !== undefined ? !!metadata.visible : true,
      defaultProps: metadata.defaultProps || {}
    };

    this.panels.set(id, panelConfig);
    logger.info('System', `DashboardRegistry: Successfully registered panel '${id}' ("${title}")`);
  }

  /**
   * Retrieves metadata config of a registered panel
   * @param {string} id 
   * @returns {object|undefined}
   */
  get(id) {
    return this.panels.get(id);
  }

  /**
   * Returns all registered dashboard panels sorted by order
   * @returns {Array<object>}
   */
  getPanels() {
    return Array.from(this.panels.values())
      .filter(p => p.visible)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Clears the registry (useful for testing)
   */
  clear() {
    this.panels.clear();
    logger.debug('System', 'DashboardRegistry: Registry cleared');
  }
}

export const dashboardRegistry = new DashboardRegistry();
export default dashboardRegistry;
