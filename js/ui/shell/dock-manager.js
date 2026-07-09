import { BaseManager } from '../../core/base-manager.js';
import { EVENTS } from '../../core/events.js';
import { logger } from '../../diagnostics/logger.js';

class DockManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.storageKey = 'stadiumos_dock_layout';
    this.context = null;
    this.shellStore = null;
    this.eventBus = null;
  }

  /**
   * Initializes DockManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();
    
    this.context = context;
    this.shellStore = context.get('shellStore');
    this.eventBus = context.get('eventBus');

    // Auto-restore persisted layout on startup
    const savedLayout = this.exportLayout();
    if (savedLayout) {
      try {
        this.importLayout(savedLayout);
        logger.info('System', 'DockManager: Restored persisted panel docking layout configurations.');
      } catch (err) {
        logger.error('System', 'DockManager: Failed to parse saved layout configurations', err);
      }
    }
  }

  exportLayout() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return saved;
      
      if (this.shellStore) {
        const state = this.shellStore.getState();
        return JSON.stringify({
          panelsVisibility: state.panelsVisibility,
          workspaceLayout: state.workspaceLayout
        });
      }
      return null;
    } catch (err) {
      logger.error('System', 'DockManager: Export failed', err);
      return null;
    }
  }

  importLayout(serializedLayout) {
    if (!serializedLayout) return;
    const data = JSON.parse(serializedLayout);
    if (data && data.panelsVisibility && this.shellStore) {
      this.shellStore.setState({
        panelsVisibility: data.panelsVisibility,
        workspaceLayout: data.workspaceLayout || 'default'
      });
      
      localStorage.setItem(this.storageKey, serializedLayout);
      if (this.eventBus) {
        this.eventBus.publish(EVENTS.UI.PANEL_DOCK_UPDATED, data.panelsVisibility);
      }
    }
  }

  resetLayout() {
    localStorage.removeItem(this.storageKey);
    if (this.shellStore) {
      this.shellStore.reset();
      const state = this.shellStore.getState();
      if (this.eventBus) {
        this.eventBus.publish(EVENTS.UI.PANEL_DOCK_UPDATED, state.panelsVisibility);
      }
    }
    logger.info('System', 'DockManager: Docking layout configuration reset completed.');
  }

  setPanelVisibility(panelId, visible) {
    if (!this.shellStore) return;

    const state = this.shellStore.getState();
    const nextVis = { ...state.panelsVisibility, [panelId]: !!visible };
    
    this.shellStore.setState({ panelsVisibility: nextVis });
    
    const serialized = JSON.stringify({
      panelsVisibility: nextVis,
      workspaceLayout: state.workspaceLayout
    });
    localStorage.setItem(this.storageKey, serialized);
    if (this.eventBus) {
      this.eventBus.publish(EVENTS.UI.PANEL_DOCK_UPDATED, nextVis);
    }
  }

  dispose() {
    this.context = null;
    this.shellStore = null;
    this.eventBus = null;
    super.dispose();
  }

  getDiagnostics() {
    const panelsCount = this.shellStore 
      ? Object.values(this.shellStore.getState().panelsVisibility).filter(Boolean).length
      : 0;

    return {
      storageKeyUsed: this.storageKey,
      visiblePanelsCount: panelsCount
    };
  }
}

export const dockManager = new DockManager();
export default dockManager;
