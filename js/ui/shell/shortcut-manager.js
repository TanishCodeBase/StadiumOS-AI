import { BaseManager } from '../../core/base-manager.js';
import { logger } from '../../diagnostics/logger.js';

class ShortcutManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.shortcuts = new Map();
    this.keyListener = null;
    this.enabled = true;
    this.context = null;
  }

  /**
   * Initializes ShortcutManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;

    // Hook keyboard interceptor
    this.keyListener = (e) => this.handleKeyDown(e);
    this.addListener(window, 'keydown', this.keyListener);
    
    logger.info('System', 'ShortcutManager: Keyboard interceptor listener hooked.');
  }

  register(combination, callback, description = '') {
    if (!combination || typeof callback !== 'function') return;

    const normalized = combination.toLowerCase().trim();
    this.shortcuts.set(normalized, {
      callback,
      description,
      enabled: true
    });
    logger.debug('System', `ShortcutManager: Registered shortcut '${normalized}' ("${description}")`);
  }

  unregister(combination) {
    const normalized = combination.toLowerCase().trim();
    if (this.shortcuts.has(normalized)) {
      this.shortcuts.delete(normalized);
      logger.debug('System', `ShortcutManager: Unregistered shortcut '${normalized}'`);
    }
  }

  enableShortcut(combination) {
    const normalized = combination.toLowerCase().trim();
    if (this.shortcuts.has(normalized)) {
      this.shortcuts.get(normalized).enabled = true;
    }
  }

  disableShortcut(combination) {
    const normalized = combination.toLowerCase().trim();
    if (this.shortcuts.has(normalized)) {
      this.shortcuts.get(normalized).enabled = false;
    }
  }

  setEnabled(active) {
    this.enabled = !!active;
    logger.debug('System', `ShortcutManager: Shortcuts global status set to ${this.enabled}`);
  }

  handleKeyDown(e) {
    if (!this.enabled || !this.initialized) return;

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');

    const keyName = e.key.toLowerCase();
    if (['control', 'shift', 'alt', 'meta'].includes(keyName)) return;

    parts.push(keyName);
    const combination = parts.join('+');

    const shortcut = this.shortcuts.get(combination);
    if (shortcut && shortcut.enabled) {
      e.preventDefault();
      try {
        shortcut.callback();
      } catch (err) {
        logger.error('System', `ShortcutManager: Error executing shortcut '${combination}'`, err);
      }
    }
  }

  dispose() {
    this.shortcuts.clear();
    this.context = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      shortcutsCount: this.shortcuts.size,
      globalEnabledStatus: this.enabled,
      shortcutsRegistered: Array.from(this.shortcuts.keys())
    };
  }
}

export const shortcutManager = new ShortcutManager();
export default shortcutManager;
