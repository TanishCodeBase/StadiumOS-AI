import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { store } from '../../core/store.js';
import { CONFIG } from '../../config.js';

export class StatusBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeState: store.getState()
    };

    // Register store subscription with automatic component cleanup tracker
    const unsubscribeStore = store.subscribe((state) => {
      this.setState({ storeState: state });
    });
    this.addSubscription(unsubscribeStore);
  }

  render() {
    const { systemStatus, app } = this.state.storeState;

    return h('footer', { className: 'app-footer' }, [
      h('div', { className: 'footer-section' }, [
        h('span', { className: 'footer-tag' }, `VER: ${app.version}`),
        h('span', { className: 'footer-tag uppercase' }, `ENV: ${CONFIG.ENV}`)
      ]),

      h('div', { className: 'footer-message' }, [
        h('span', { className: 'message-label' }, 'STATUS:'),
        h('span', { className: 'message-text' }, systemStatus.message)
      ]),

      h('div', { className: 'footer-metrics' }, [
        h('div', { className: 'footer-metric' }, [
          h('span', { className: 'metric-label' }, 'UI REFRESSH'),
          h('span', { className: 'metric-value' }, `${systemStatus.fps} FPS`)
        ]),
        h('div', { className: 'footer-metric' }, [
          h('span', { className: 'metric-label' }, 'STORE MEM'),
          h('span', { className: 'metric-value' }, systemStatus.memory)
        ]),
        h('div', { className: 'footer-metric' }, [
          h('span', { className: 'metric-label' }, 'ACTIVE INCIDENTS'),
          h('span', { className: 'metric-value highlight' }, String(systemStatus.activeIncidents))
        ])
      ])
    ]);
  }
}
export default StatusBar;
