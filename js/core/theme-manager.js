import { BaseManager } from './base-manager.js';
import { logger } from '../diagnostics/logger.js';

class ThemeManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.activeTheme = 'theme-dark';
    this.listeners = new Set();
    this.context = null;
  }

  /**
   * Initializes theme setting from storage or configuration, applying classes to body.
   * @param {AppContext} context dependency context
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();
    
    this.context = context;
    const config = context.get('config');

    const storedTheme = localStorage.getItem('stadiumos-theme');
    const defaultTheme = config.THEME?.DEFAULT || 'dark';
    
    this.activeTheme = storedTheme || `theme-${defaultTheme}`;
    this._applyThemeClasses();
    
    logger.info('System', `ThemeManager: Initialized with active theme '${this.activeTheme}'`);
  }

  /**
   * Updates current active theme
   * @param {string} themeName e.g., 'theme-dark' or 'theme-light'
   */
  setTheme(themeName) {
    if (this.activeTheme === themeName) return;

    const previousTheme = this.activeTheme;
    this.activeTheme = themeName;
    
    localStorage.setItem('stadiumos-theme', themeName);
    this._applyThemeClasses();
    
    logger.info('System', `ThemeManager: Changed theme from '${previousTheme}' to '${themeName}'`);

    // Notify all subscribers
    for (const callback of this.listeners) {
      try {
        callback(themeName, previousTheme);
      } catch (err) {
        logger.error('System', 'ThemeManager: Error executing theme update listener callback', err);
      }
    }
  }

  getTheme() {
    return this.activeTheme;
  }

  /**
   * Subscribe to theme changes
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  _applyThemeClasses() {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
      document.body.classList.add(this.activeTheme);
    }
  }

  dispose() {
    this.listeners.clear();
    this.context = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      activeThemeName: this.activeTheme,
      listenersCount: this.listeners.size
    };
  }
}

export const themeManager = new ThemeManager();
export default themeManager;
