import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { store } from '../../core/store.js';
import { themeManager } from '../../core/theme-manager.js';
import { layoutManager } from '../../core/layout-manager.js';

export class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: new Date().toLocaleTimeString(),
      storeState: store.getState(),
      themeName: themeManager.getTheme(),
      layoutName: layoutManager.getCurrentLayout()
    };
    
    // Subscribe to Store updates
    const unsubscribeStore = store.subscribe((state) => {
      this.setState({ storeState: state });
    });
    this.addSubscription(unsubscribeStore);

    // Subscribe to Theme changes
    const unsubscribeTheme = themeManager.subscribe((theme) => {
      this.setState({ themeName: theme });
    });
    this.addSubscription(unsubscribeTheme);

    // Subscribe to Layout changes
    const unsubscribeLayout = layoutManager.subscribe((layout) => {
      this.setState({ layoutName: layout });
    });
    this.addSubscription(unsubscribeLayout);
  }

  onMount() {
    // Use Component's built-in cleanup timer wrapper
    this.addInterval(() => {
      this.setState({ currentTime: new Date().toLocaleTimeString() });
    }, 1000);
  }

  handleToggleSim() {
    store.dispatch({ type: 'TOGGLE_SIMULATION' });
  }

  handleThemeToggle() {
    const currentTheme = themeManager.getTheme();
    const nextTheme = currentTheme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    themeManager.setTheme(nextTheme);
  }

  handleLayoutChange(newLayout) {
    layoutManager.setLayout(newLayout);
  }

  render() {
    const { isOnline, message } = this.state.storeState.systemStatus;
    const { isPlaying, speed } = this.state.storeState.simulation;
    const { themeName, layoutName } = this.state;

    return h('header', { className: 'app-header' }, [
      h('div', { className: 'header-branding' }, [
        h('div', { className: 'logo-dot' }),
        h('div', { className: 'title-container' }, [
          h('h1', { className: 'app-title' }, 'STADIUMOS AI'),
          h('span', { className: 'app-subtitle' }, 'OPERATIONS COMMAND CENTER')
        ])
      ]),
      
      h('div', { className: 'header-controls' }, [
        // Layout selection dropdown
        h('div', { className: 'header-select-wrapper' }, [
          h('select', { 
            className: 'select-control', 
            onchange: (e) => this.handleLayoutChange(e.target.value),
            value: layoutName
          }, [
            h('option', { value: 'default' }, 'DEFAULT GRID'),
            h('option', { value: 'compact' }, 'COMPACT GRID'),
            h('option', { value: 'emergency' }, 'EMERGENCY LAYOUT'),
            h('option', { value: 'fullscreen' }, 'FULLSCREEN TWIN')
          ])
        ]),

        // Theme toggle button
        h('button', { 
          className: 'btn-theme-control', 
          onclick: () => this.handleThemeToggle()
        }, themeName === 'theme-dark' ? '☀ LIGHT MODE' : '☾ DARK MODE'),

        // Simulation status toggle
        h('button', { 
          className: `btn-sim-control ${isPlaying ? 'active' : ''}`, 
          onclick: () => this.handleToggleSim()
        }, isPlaying ? '⏸ PAUSE SIMULATION' : '▶ START SIMULATION'),
        
        h('div', { className: 'header-metric' }, [
          h('span', { className: 'metric-label' }, 'SIM SPEED'),
          h('span', { className: 'metric-value' }, `${speed.toFixed(1)}x`)
        ]),

        h('div', { className: 'header-status-indicator' }, [
          h('span', { className: `status-dot ${isOnline ? 'online' : 'offline'}` }),
          h('span', { className: 'status-text' }, isOnline ? 'CONNECTED' : 'DISCONNECTED')
        ]),

        h('div', { className: 'header-clock' }, this.state.currentTime)
      ])
    ]);
  }
}
