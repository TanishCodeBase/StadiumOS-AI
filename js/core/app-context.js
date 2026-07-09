import { logger } from '../diagnostics/logger.js';

class AppContext {
  constructor() {
    this._dependencies = new Map();
    this._initialized = false;
  }

  /**
   * Registers a dependency inside the AppContext
   * @param {string} name 
   * @param {any} instance 
   */
  register(name, instance) {
    if (this._initialized) {
      throw new Error('AppContext: Cannot register dependencies after AppContext has been initialized.');
    }
    this._dependencies.set(name, instance);
    logger.debug('System', `AppContext: Registered dependency reference for '${name}'`);
  }

  /**
   * Freezes the context container to make it immutable after setup
   */
  initialize() {
    if (this._initialized) return;
    this._initialized = true;
    
    // Freeze dependencies map reference to lock container entries
    Object.freeze(this._dependencies);
    Object.freeze(this);
    
    logger.info('System', 'AppContext: Dependency Container initialized and frozen.');
  }

  /**
   * Retrieves a dependency instance by name
   * @param {string} name 
   * @returns {any}
   */
  get(name) {
    if (!this._dependencies.has(name)) {
      throw new Error(`AppContext: Dependency '${name}' not registered inside context container.`);
    }
    return this._dependencies.get(name);
  }

  has(name) {
    return this._dependencies.has(name);
  }

  getAll() {
    return Array.from(this._dependencies.keys());
  }
}

export const appContext = new AppContext();
export default appContext;
