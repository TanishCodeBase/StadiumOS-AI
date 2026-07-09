import { BaseManager } from '../../core/base-manager.js';
import { logger } from '../../diagnostics/logger.js';

class WorkspaceManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.activeLayout = 'default';
    this.context = null;
    this.shellStore = null;
    this.layoutManager = null;
  }

  /**
   * Initializes WorkspaceManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();
    
    this.context = context;
    this.shellStore = context.get('shellStore');
    this.layoutManager = context.get('layoutManager');

    // Sync initially with shellStore
    const state = this.shellStore.getState();
    this.activeLayout = state.workspaceLayout;

    // Listen to workspace layout overrides
    const unsubscribeStore = this.shellStore.subscribe((nextState) => {
      if (nextState.workspaceLayout !== this.activeLayout) {
        this.setLayout(nextState.workspaceLayout);
      }
    });
    this.addSubscription(unsubscribeStore);
  }

  /**
   * Updates current active layout name
   * @param {string} layoutName default, compact, emergency, fullscreen
   */
  setLayout(layoutName) {
    if (!this.initialized) return;
    this.activeLayout = layoutName;
    this.layoutManager.setLayout(layoutName);
    
    if (this.shellStore.getState().workspaceLayout !== layoutName) {
      this.shellStore.setState({ workspaceLayout: layoutName });
    }
    
    logger.debug('System', `WorkspaceManager: Active layout swapped to '${layoutName}'`);
  }

  dispose() {
    this.context = null;
    this.shellStore = null;
    this.layoutManager = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      activeLayoutName: this.activeLayout,
      availableLayoutsList: ['default', 'compact', 'emergency', 'fullscreen']
    };
  }
}

export const workspaceManager = new WorkspaceManager();
export default workspaceManager;
