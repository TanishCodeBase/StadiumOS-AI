import { BaseManager } from '../../core/base-manager.js';
import { EVENTS } from '../../core/events.js';

class ShellStore extends BaseManager {
  constructor() {
    super('1.0.0');
    this.state = {
      sidebarOpen: true,
      workspaceLayout: 'default',
      theme: 'dark',
      commandPaletteOpen: false,
      focusedPanelId: null,
      utilityPanelOpen: false,
      panelsVisibility: {
        'digital-twin': true,
        'ai-recommendations': true,
        'incidents': true,
        'transport': true,
        'timeline': true,
        'health': true,
        'emergency': true,
        'volunteers': true,
        'system-status': true,
        'layer-controls': true,
        'ai-explanation': true
      }
    };
    this.listeners = new Set();
    this.context = null;
    this.eventBus = null;
  }

  /**
   * Initializes ShellStore with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;
    this.eventBus = context.get('eventBus');
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    const prevState = { ...this.state };
    
    this.state = {
      ...this.state,
      ...updates,
      panelsVisibility: updates.panelsVisibility 
        ? { ...this.state.panelsVisibility, ...updates.panelsVisibility }
        : this.state.panelsVisibility
    };

    this.listeners.forEach(listener => {
      try {
        listener(this.state, prevState);
      } catch (err) {
        console.error('ShellStore listener error:', err);
      }
    });

    if (this.eventBus) {
      this.eventBus.publish(EVENTS.UI.LAYOUT_CHANGED, { state: this.state, prevState });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset() {
    this.setState({
      sidebarOpen: true,
      workspaceLayout: 'default',
      theme: 'dark',
      commandPaletteOpen: false,
      focusedPanelId: null,
      utilityPanelOpen: false,
      panelsVisibility: {
        'digital-twin': true,
        'ai-recommendations': true,
        'incidents': true,
        'transport': true,
        'timeline': true,
        'health': true,
        'emergency': true,
        'volunteers': true,
        'system-status': true,
        'layer-controls': true,
        'ai-explanation': true
      }
    });
  }

  dispose() {
    this.listeners.clear();
    this.context = null;
    this.eventBus = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      listenersCount: this.listeners.size,
      activeTheme: this.state.theme,
      commandPaletteActive: this.state.commandPaletteOpen
    };
  }
}

export const shellStore = new ShellStore();
export default shellStore;
