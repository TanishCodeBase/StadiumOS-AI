import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { eventBus } from '../../core/event-bus.js';
import { notificationManager } from './notification-manager.js';
import { EVENTS } from '../../core/events.js';

export class NotificationCenter extends Component {
  constructor(props) {
    super(props);
    // Initialize state with a synchronous snapshot only.
    // Reactive subscriptions are registered in onMount() to prevent
    // reentrant reconciliation during the initial mount cycle.
    this.state = {
      notifications: notificationManager.getNotifications()
    };
  }

  onMount() {
    // Subscribes purely to display queue state updates — safe after DOM is mounted
    const unsubscribe = eventBus.subscribe(EVENTS.NOTIFICATIONS.NOTIFICATION_DISPATCHED, (queue) => {
      this.setState({ notifications: [...queue] });
    });
    this.addSubscription(unsubscribe);
  }

  render() {
    const { notifications } = this.state;

    if (notifications.length === 0) {
      return h('div', { className: 'notification-center-container empty' });
    }

    const toastElements = notifications.map(n => {
      let icon = 'ℹ️';
      if (n.type === 'SUCCESS') icon = '✅';
      else if (n.type === 'WARNING') icon = '⚠️';
      else if (n.type === 'CRITICAL') icon = '🚨';

      return h('div', { 
        className: `notification-toast ${n.type.toLowerCase()}`,
        id: n.id,
        key: n.id
      }, [
        h('div', { className: 'toast-body' }, [
          h('span', { className: 'toast-icon' }, icon),
          h('span', { className: 'toast-message' }, n.message)
        ]),
        h('button', { 
          className: 'toast-dismiss-btn',
          onclick: (e) => {
            e.stopPropagation();
            notificationManager.removeNotification(n.id);
          }
        }, '×')
      ]);
    });

    return h('div', { className: 'notification-center-container' }, toastElements);
  }
}
export default NotificationCenter;
