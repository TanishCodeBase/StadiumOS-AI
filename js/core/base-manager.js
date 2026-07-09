import { logger } from '../diagnostics/logger.js';

export class BaseManager {
  constructor(version = '1.0.0') {
    this.initialized = false;
    this.healthy = true;
    this.version = version;
    this.lastUpdated = new Date().toISOString();
    this._cleanups = [];
  }

  /**
   * Initializes the manager
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.lastUpdated = new Date().toISOString();
    logger.debug('System', `Manager [${this.constructor.name}]: Initialized`);
  }

  /**
   * Disposes of the manager, running all registered cleanups
   */
  dispose() {
    if (!this.initialized) return;
    this.initialized = false;
    this.lastUpdated = new Date().toISOString();
    
    // Execute all registered cleanups
    this._cleanups.forEach(c => {
      try {
        c.cleanup();
      } catch (err) {
        logger.error('System', `Manager [${this.constructor.name}]: Error running cleanup of type ${c.type}`, err);
      }
    });
    this._cleanups = [];
    
    logger.debug('System', `Manager [${this.constructor.name}]: Disposed`);
  }

  /**
   * Returns a standardized status object for aggregate diagnostics
   * @returns {object}
   */
  getStatus() {
    return {
      initialized: this.initialized,
      healthy: this.healthy,
      version: this.version,
      lastUpdated: this.lastUpdated,
      diagnostics: this.getDiagnostics()
    };
  }

  /**
   * Subclasses override to provide custom diagnostics
   * @returns {object}
   */
  getDiagnostics() {
    return {
      cleanupsCount: this._cleanups.size
    };
  }

  // Cleanup registration helpers (similar to Component class)
  
  addTimer(callback, delay) {
    const id = setTimeout(() => {
      this._cleanups = this._cleanups.filter(c => c.id !== id);
      callback();
    }, delay);
    this._cleanups.push({
      type: 'timer',
      id,
      cleanup: () => clearTimeout(id)
    });
    return id;
  }

  addInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this._cleanups.push({
      type: 'interval',
      id,
      cleanup: () => clearInterval(id)
    });
    return id;
  }

  addListener(target, type, listener, options) {
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(type, listener, options);
      this._cleanups.push({
        type: 'listener',
        cleanup: () => target.removeEventListener(type, listener)
      });
    }
  }

  addSubscription(unsubscribeFn) {
    if (typeof unsubscribeFn === 'function') {
      this._cleanups.push({
        type: 'subscription',
        cleanup: unsubscribeFn
      });
    }
  }

  addCleanup(fn) {
    if (typeof fn === 'function') {
      this._cleanups.push({
        type: 'custom',
        cleanup: fn
      });
    }
  }
}
export default BaseManager;
