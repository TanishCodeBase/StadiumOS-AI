import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { shellStore } from './shell-store.js';
import { dockManager } from './dock-manager.js';
import { store } from '../../core/store.js';
import { dashboardRegistry } from '../../core/dashboard-registry.js';
import { layoutManager } from '../../core/layout-manager.js';
import { CommandPalette } from './command-palette.js';
import { NotificationCenter } from './notification-center.js';
import { PanelHost } from './panel-host.js';
import { ExecutiveOverview } from '../components/ExecutiveOverview.js';

export class ApplicationShell extends Component {
  constructor(props) {
    super(props);

    // Initialize state with synchronous snapshots only.
    // Reactive subscriptions are registered in onMount() to prevent
    // reentrant reconciliation during the initial mount cycle.
    this.state = {
      shellState: shellStore.getState(),
      appState: store.getState()
    };
  }

  onMount() {
    // Listen to ShellStore state updates
    const unsubscribeShell = shellStore.subscribe((state) => {
      this.setState({ shellState: state });
    });
    this.addSubscription(unsubscribeShell);

    // Listen to main Store state updates
    const unsubscribeStore = store.subscribe((state) => {
      this.setState({ appState: state });
    });
    this.addSubscription(unsubscribeStore);
  }

  toggleSidebar() {
    const { sidebarOpen } = this.state.shellState;
    shellStore.setState({ sidebarOpen: !sidebarOpen });
  }

  toggleUtilityPanel() {
    const { utilityPanelOpen } = this.state.shellState;
    shellStore.setState({ utilityPanelOpen: !utilityPanelOpen });
  }

  handleThemeToggle() {
    const current = this.state.shellState.theme;
    const next = current === 'dark' ? 'light' : current === 'light' ? 'high-contrast' : 'dark';
    shellStore.setState({ theme: next });

    // Sync with HTML element styles
    document.body.className = `theme-${next}`;
  }

  render() {
    const { shellState, appState } = this.state;
    const { sidebarOpen, utilityPanelOpen, panelsVisibility, theme } = shellState;
    const { isPlaying, speed, tickCount, latestFrame, latestDecisionFrame } = appState.simulation;
    const { message, fps, memory } = appState.systemStatus;

    const panels = dashboardRegistry.getPanels();

    // Map visible panels to PanelHost nodes
    const activeHosts = panels
      .map(panel => {
        const isVisible = panelsVisibility[panel.id];
        if (!isVisible) return null;

        const placement = layoutManager.getPanelPlacement(panel.id);
        if (!placement.visible) return null;

        return h(PanelHost, {
          id: panel.id,
          title: panel.title,
          component: panel.component,
          defaultProps: panel.defaultProps,
          placement,
          latestFrame,
          latestDecisionFrame,
          key: panel.id
        });
      })
      .filter(Boolean);

    return h('div', { className: `app-container theme-${theme}` }, [
      // 1. Application Header
      h('header', { className: 'app-header' }, [
        h('div', { className: 'header-left' }, [
          h('button', {
            className: 'sidebar-toggle-btn',
            onclick: () => this.toggleSidebar()
          }, '☰'),
          h('h1', { className: 'app-title' }, 'StadiumOS AI'),
          h('span', { className: 'app-subtitle' }, 'NOC Operations Shell')
        ]),

        // Simulation Controls
        h('div', { className: 'header-controls' }, [
          h('button', {
            className: `btn-ctrl play-btn ${isPlaying ? 'active' : ''}`,
            onclick: () => store.dispatch({ type: 'TOGGLE_SIMULATION' })
          }, isPlaying ? '⏸ PAUSE' : '▶ START'),

          h('select', {
            className: 'speed-select',
            value: String(speed),
            onchange: (e) => store.dispatch({ type: 'SET_SIMULATION_SPEED', payload: parseFloat(e.target.value) })
          }, [
            h('option', { value: '1' }, '1.0x Speed'),
            h('option', { value: '2' }, '2.0x Speed'),
            h('option', { value: '4' }, '4.0x Speed'),
            h('option', { value: '8' }, '8.0x Speed')
          ]),

          h('button', {
            className: 'theme-toggle-btn',
            onclick: () => this.handleThemeToggle()
          }, `🌓 THEME: ${theme.toUpperCase()}`)
        ]),

        h('div', { className: 'header-status' }, [
          h('span', { className: 'header-status-indicator online' }, 'NOC CONNECTED'),
          h('span', { className: 'header-clock' }, `TICK: ${tickCount}`)
        ])
      ]),

      // Executive Operations Overview Ribbon
      h(ExecutiveOverview, { latestFrame, latestDecisionFrame }),

      h('div', { className: 'app-body' }, [
        // 2. Collapsible Left Sidebar (NOC Info & Controls)
        sidebarOpen
          ? h('aside', { className: 'app-sidebar left' }, [
            h('h4', { className: 'sidebar-section-title' }, 'SYSTEM STATUS'),
            h('div', { className: 'sidebar-item' }, [
              h('span', { className: 'lbl' }, 'CLOCK FREQ'),
              h('span', { className: 'val' }, `${speed} Hz`)
            ]),
            h('div', { className: 'sidebar-item' }, [
              h('span', { className: 'lbl' }, 'STABILITY'),
              h('span', { className: 'val ok' }, '99.8%')
            ]),

            h('h4', { className: 'sidebar-section-title' }, 'KEYBOARD SHORTCUTS'),
            h('div', { className: 'shortcut-row' }, [
              h('kbd', null, 'Ctrl+K'),
              h('span', null, 'Command Palette')
            ]),
            h('div', { className: 'shortcut-row' }, [
              h('kbd', null, 'Ctrl+/'),
              h('span', null, 'Toggle Sidebar')
            ]),
            h('div', { className: 'shortcut-row' }, [
              h('kbd', null, 'Escape'),
              h('span', null, 'Close Modal')
            ]),

            h('h4', { className: 'sidebar-section-title' }, 'LAYOUTS'),
            h('div', { className: 'layout-presets' }, [
              h('button', { onclick: () => shellStore.setState({ workspaceLayout: 'default' }) }, 'Default Grid'),
              h('button', { onclick: () => shellStore.setState({ workspaceLayout: 'compact' }) }, 'Compact Grid'),
              h('button', { onclick: () => shellStore.setState({ workspaceLayout: 'emergency' }) }, 'Emergency Layout')
            ])
          ])
          : null,

        // 3. Main 12-Column Grid Workspace WorkspaceManager
        h('main', { className: 'dashboard-grid-container app-workspace' }, activeHosts),

        // 4. Collapsible Right Utility Panel (Dock & Visibility controller)
        utilityPanelOpen
          ? h('aside', { className: 'app-sidebar right' }, [
            h('h4', { className: 'sidebar-section-title' }, 'DOCK MANAGER'),
            h('div', { className: 'panel-visibility-toggles' },
              panels.map(panel => {
                const isVisible = !!panelsVisibility[panel.id];
                return h('label', { className: 'visibility-toggle-row' }, [
                  h('input', {
                    type: 'checkbox',
                    checked: isVisible,
                    onchange: (e) => dockManager.setPanelVisibility(panel.id, e.target.checked)
                  }),
                  h('span', null, panel.title)
                ]);
              })
            ),
            h('hr', { className: 'sidebar-divider' }),
            h('button', {
              className: 'sidebar-btn reset-layout-btn',
              onclick: () => dockManager.resetLayout()
            }, 'RESET DOCK LAYOUT')
          ])
          : null,

        // Small Utility expand tab
        h('button', {
          className: `utility-panel-toggle-tab ${utilityPanelOpen ? 'open' : ''}`,
          onclick: () => this.toggleUtilityPanel()
        }, utilityPanelOpen ? '❯' : '❮')
      ]),

      // 5. Footer Status Bar
      h('footer', { className: 'app-footer' }, [
        h('span', { className: 'footer-status-msg' }, `SYSTEM ALERT: ${message}`),
        h('div', { className: 'footer-metrics' }, [
          h('span', null, `AI PIPELINE: ${latestDecisionFrame?.metrics?.executionTimeMs?.toFixed(2) || '0.00'}ms`),
          h('span', null, `FPS: ${fps}`),
          h('span', null, `MEM: ${memory}`)
        ])
      ]),

      // Global floating UI modals
      h(CommandPalette),
      h(NotificationCenter)
    ]);
  }
}
export default ApplicationShell;
