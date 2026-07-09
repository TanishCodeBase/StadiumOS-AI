import { BaseManager } from '../../core/base-manager.js';
import { EVENTS } from '../../core/events.js';
import { logger } from '../../diagnostics/logger.js';

class NotificationManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.queue = [];
    this.idCounter = 0;
    this.context = null;
    this.eventBus = null;
  }

  /**
   * Initializes NotificationManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;
    this.eventBus = context.get('eventBus');

    // Telemetry and AI event streams subscriptions
    this.eventBus.subscribe(EVENTS.SIMULATION.SIMULATION_FRAME, (frame) => {
      const incidents = frame.behaviors?.IncidentSimulation?.entities || [];
      incidents.forEach(inc => {
        if (inc.status === 'Created') {
          this.addNotification({
            message: `[Alert] New incident reported: ${inc.type} at ${inc.location}.`,
            type: inc.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            priority: inc.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
            duration: 6000
          });
        }
      });

      const transitRoutes = frame.behaviors?.TransitSimulation?.entities || [];
      transitRoutes.forEach(r => {
        if (r.status === 'DELAYED') {
          this.addNotification({
            message: `[Transit] Route ${r.line} experiencing delays.`,
            type: 'WARNING',
            priority: 'MEDIUM',
            duration: 5000
          });
        }
      });
    });

    this.eventBus.subscribe(EVENTS.AI.AI_DECISION_FRAME, (decFrame) => {
      const recs = decFrame.recommendations || [];
      recs.forEach(rec => {
        this.addNotification({
          message: `[AI Alert] Suggestion compiled: ${rec.action}.`,
          type: 'SUCCESS',
          priority: 'MEDIUM',
          duration: 7000
        });
      });
    });
  }

  /**
   * Adds a notification to the active queue with deduplication and timeout lifecycles
   * @param {object} n 
   */
  addNotification({ message, type = 'INFORMATION', priority = 'LOW', duration = 5000 }) {
    if (!this.initialized) return null;

    const normType = type.toUpperCase();
    const existing = this.queue.find(item => item.message === message && item.type === normType);
    if (existing) {
      existing.timestamp = Date.now();
      
      if (existing.timeoutId) {
        clearTimeout(existing.timeoutId);
      }
      
      existing.timeoutId = setTimeout(() => {
        this.removeNotification(existing.id);
      }, duration);
      
      if (this.eventBus) {
        this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_DISPATCHED, this.queue);
      }
      return existing.id;
    }

    this.idCounter++;
    const id = `NOTIF-${this.idCounter}`;

    const item = {
      id,
      message,
      type: normType,
      priority: priority.toUpperCase(),
      timestamp: Date.now(),
      timeoutId: null
    };

    item.timeoutId = setTimeout(() => {
      this.removeNotification(id);
    }, duration);

    const prioritiesMap = { HIGH: 2, MEDIUM: 1, LOW: 0 };
    this.queue.push(item);
    this.queue.sort((a, b) => (prioritiesMap[b.priority] || 0) - (prioritiesMap[a.priority] || 0));

    if (this.eventBus) {
      this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_QUEUED, item);
      this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_DISPATCHED, this.queue);
    }
    
    logger.debug('System', `NotificationManager: Dispatched alert '${id}' type '${type}'`);
    return id;
  }

  removeNotification(id) {
    const item = this.queue.find(n => n.id === id);
    if (item) {
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
      }
      this.queue = this.queue.filter(n => n.id !== id);
      if (this.eventBus) {
        this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_CLEARED, id);
        this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_DISPATCHED, this.queue);
      }
    }
  }

  clear() {
    this.queue.forEach(item => {
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
      }
    });
    this.queue = [];
    if (this.eventBus) {
      this.eventBus.publish(EVENTS.NOTIFICATIONS.NOTIFICATION_DISPATCHED, this.queue);
    }
  }

  clearAll() {
    this.clear();
  }

  getNotifications() {
    return this.queue;
  }

  dispose() {
    this.clear();
    this.eventBus = null;
    this.context = null;
    super.dispose();
  }
}

export const notificationManager = new NotificationManager();
export default notificationManager;
