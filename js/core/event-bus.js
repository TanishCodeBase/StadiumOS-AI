import { logger } from '../diagnostics/logger.js';
import { assertPayload } from './validators.js';

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event 
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    logger.debug('EventBus', `Subscribed to event '${event}'`);

    return () => {
      this.unsubscribe(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} event 
   * @param {Function} callback 
   */
  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
      logger.debug('EventBus', `Unsubscribed from event '${event}'`);
    }
  }

  /**
   * Publish an event to all subscribers
   * @param {string} event 
   * @param {any} data 
   */
  publish(event, data) {
    logger.debug('EventBus', `Publishing event '${event}'`, data);
    
    // Run contract assertions
    assertPayload(event, data);

    if (!this.listeners.has(event)) return;

    for (const callback of this.listeners.get(event)) {
      try {
        callback(data);
      } catch (err) {
        logger.error('EventBus', `Error executing callback for event '${event}'`, err);
      }
    }
  }
}

export const eventBus = new EventBus();
export default eventBus;
