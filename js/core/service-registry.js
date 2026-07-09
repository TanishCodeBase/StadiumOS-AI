import { BaseManager } from './base-manager.js';
import { logger } from '../diagnostics/logger.js';

class ServiceRegistry extends BaseManager {
  constructor() {
    super('1.0.0');
    this.services = new Map();
    // Maintain registration order for clean reverse-disposal logic
    this.registrationOrder = [];
  }

  /**
   * Registers a service instance
   * @param {string} name 
   * @param {BaseManager} service 
   */
  register(name, service) {
    if (!name || !service) {
      logger.error('System', 'ServiceRegistry: Cannot register invalid name or service instance.');
      return;
    }

    if (this.services.has(name)) {
      logger.warn('System', `ServiceRegistry: Service '${name}' is already registered. Overwriting.`);
      this.unregister(name);
    }

    this.services.set(name, service);
    this.registrationOrder.push(name);
    logger.debug('System', `ServiceRegistry: Registered service '${name}'`);
  }

  /**
   * Unregisters a service
   * @param {string} name 
   */
  unregister(name) {
    if (this.services.has(name)) {
      const service = this.services.get(name);
      try {
        if (service.initialized) {
          service.dispose();
        }
      } catch (err) {
        logger.error('System', `ServiceRegistry: Error disposing service '${name}' during unregistration`, err);
      }
      this.services.delete(name);
      this.registrationOrder = this.registrationOrder.filter(n => n !== name);
      logger.debug('System', `ServiceRegistry: Unregistered service '${name}'`);
    }
  }

  has(name) {
    return this.services.has(name);
  }

  get(name) {
    return this.services.get(name);
  }

  /**
   * Returns list of all registered services
   * @returns {Array<BaseManager>}
   */
  getAll() {
    return Array.from(this.services.values());
  }

  /**
   * Initializes all registered services sequentially using the AppContext
   * @param {AppContext} context 
   */
  initializeAll(context) {
    if (this.initialized) return;
    super.initialize();

    logger.info('System', 'ServiceRegistry: Initializing all registered NOC services...');

    this.registrationOrder.forEach(name => {
      const service = this.services.get(name);
      if (service && !service.initialized) {
        try {
          service.initialize(context);
        } catch (err) {
          logger.error('System', `ServiceRegistry: Critical error initializing service '${name}'`, err);
        }
      }
    });

    logger.info('System', 'ServiceRegistry: All services initialized successfully.');
  }

  /**
   * Disposes of all registered services in reverse registration order
   */
  disposeAll() {
    if (!this.initialized) return;

    logger.info('System', 'ServiceRegistry: Disposing of all registered NOC services...');

    // Reverse order disposal to prevent dependency violations
    [...this.registrationOrder].reverse().forEach(name => {
      const service = this.services.get(name);
      if (service && service.initialized) {
        try {
          service.dispose();
        } catch (err) {
          logger.error('System', `ServiceRegistry: Error disposing service '${name}'`, err);
        }
      }
    });

    super.dispose();
    logger.info('System', 'ServiceRegistry: All services disposed.');
  }

  /**
   * Clears all registered services from registry
   */
  clear() {
    this.disposeAll();
    this.services.clear();
    this.registrationOrder = [];
    logger.debug('System', 'ServiceRegistry: Registry cleared');
  }

  /**
   * Reset all services supporting reset operations
   */
  resetAll() {
    this.registrationOrder.forEach(name => {
      const service = this.services.get(name);
      if (service && typeof service.reset === 'function') {
        try {
          service.reset();
        } catch (err) {
          logger.error('System', `ServiceRegistry: Error resetting service '${name}'`, err);
        }
      }
    });
  }

  getStatus() {
    const parentStatus = super.getStatus();
    const serviceStatuses = {};

    this.services.forEach((service, name) => {
      serviceStatuses[name] = service.getStatus();
    });

    parentStatus.diagnostics = {
      ...parentStatus.diagnostics,
      servicesCount: this.services.size,
      services: serviceStatuses
    };

    return parentStatus;
  }
}

export const serviceRegistry = new ServiceRegistry();
export default serviceRegistry;
