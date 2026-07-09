import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { shellStore } from './shell-store.js';
import { dockManager } from './dock-manager.js';
import { focusManager } from './focus-manager.js';
import { store } from '../../core/store.js';
import { appContext } from '../../core/app-context.js';

// ViewModels imports
import { RecommendationViewModel } from '../viewmodels/RecommendationViewModel.js';
import { IncidentViewModel } from '../viewmodels/IncidentViewModel.js';
import { TimelineViewModel } from '../viewmodels/TimelineViewModel.js';
import { HealthViewModel } from '../viewmodels/HealthViewModel.js';
import { TransportViewModel } from '../viewmodels/TransportViewModel.js';
import { VolunteerViewModel } from '../viewmodels/VolunteerViewModel.js';
import { EmergencyViewModel } from '../viewmodels/EmergencyViewModel.js';
import { SystemStatusViewModel } from '../viewmodels/SystemStatusViewModel.js';

export class PanelHost extends Component {
  constructor(props) {
    super(props);
    // Initialize state with a synchronous snapshot only.
    // Reactive subscriptions are registered in onMount() to prevent
    // reentrant reconciliation during ApplicationShell's initial mount cycle.
    this.state = {
      isFocused: shellStore.getState().focusedPanelId === this.props.id,
      isCollapsed: false
    };
  }

  onMount() {
    // Subscribes to focus updates reactively — safe here because DOM is fully mounted
    const unsubscribeStore = shellStore.subscribe((state) => {
      this.setState({ isFocused: state.focusedPanelId === this.props.id });
    });
    this.addSubscription(unsubscribeStore);
  }

  handleFocus(e) {
    if (!this.state.isFocused) {
      shellStore.setState({ focusedPanelId: this.props.id });
      focusManager.focusElement(e.currentTarget);
    }
  }

  toggleCollapse() {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  render() {
    const { id, title, component, defaultProps, latestFrame, latestDecisionFrame } = this.props;
    const { isFocused, isCollapsed } = this.state;

    // Fetch placement info
    const placement = this.props.placement || { className: '', style: '' };

    // Build the specific ViewModel based on the panel ID to decouple layout panels
    let viewModel = null;
    switch (id) {
      case 'ai-recommendations':
        viewModel = new RecommendationViewModel(latestDecisionFrame, latestFrame);
        break;
      case 'incidents':
        viewModel = new IncidentViewModel(latestFrame);
        break;
      case 'timeline':
        viewModel = new TimelineViewModel(latestFrame, latestDecisionFrame);
        break;
      case 'health':
        viewModel = new HealthViewModel(latestDecisionFrame, store.getState());
        break;
      case 'transport':
        viewModel = new TransportViewModel(latestFrame);
        break;
      case 'volunteers':
        viewModel = new VolunteerViewModel(latestFrame);
        break;
      case 'emergency':
        viewModel = new EmergencyViewModel(latestFrame);
        break;
      case 'system-status':
        viewModel = new SystemStatusViewModel(appContext);
        break;
    }

    return h('div', { 
      className: `dashboard-card panel-host ${placement.className} ${isFocused ? 'focused' : ''} ${isCollapsed ? 'collapsed' : ''}`,
      style: placement.style,
      tabindex: '0',
      onfocus: (e) => this.handleFocus(e),
      onclick: (e) => this.handleFocus(e)
    }, [
      h('div', { className: 'card-header panel-host-header' }, [
        h('div', { className: 'card-header-main' }, [
          h('span', { className: 'card-status-dot' }),
          h('h3', { className: 'card-title' }, title)
        ]),
        h('div', { className: 'card-header-actions' }, [
          h('button', { 
            className: 'panel-action-btn collapse-btn',
            title: isCollapsed ? 'Expand Panel' : 'Collapse Panel',
            onclick: (e) => {
              e.stopPropagation();
              this.toggleCollapse();
            }
          }, isCollapsed ? '＋' : '－'),
          h('button', { 
            className: 'panel-action-btn close-btn',
            title: 'Hide Panel',
            onclick: (e) => {
              e.stopPropagation();
              dockManager.setPanelVisibility(id, false);
            }
          }, '×')
        ])
      ]),
      // Pass VM details dynamically, preventing direct store/bus coupling
      !isCollapsed 
        ? h('div', { className: 'card-body-scroll panel-host-body' }, [
            h(component, { ...defaultProps, viewModel })
          ])
        : h('div', { className: 'panel-collapsed-placeholder' }, 'Panel Collapsed')
    ]);
  }
}
export default PanelHost;
