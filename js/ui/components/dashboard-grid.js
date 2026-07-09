import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { store } from '../../core/store.js';
import { dashboardRegistry } from '../../core/dashboard-registry.js';
import { layoutManager } from '../../core/layout-manager.js';

export class DashboardGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layoutName: layoutManager.getCurrentLayout(),
      storeState: store.getState()
    };

    // Reactively re-render when layout changes
    const unsubscribeLayout = layoutManager.subscribe((name) => {
      this.setState({ layoutName: name });
    });
    this.addSubscription(unsubscribeLayout);

    // Reactively re-render on Store state updates (simulation ticks and AI decisions)
    const unsubscribeStore = store.subscribe((state) => {
      this.setState({ storeState: state });
    });
    this.addSubscription(unsubscribeStore);
  }

  render() {
    const panels = dashboardRegistry.getPanels();
    const latestFrame = this.state.storeState.simulation.latestFrame;
    const latestDecisionFrame = this.state.storeState.simulation.latestDecisionFrame;

    const cardElements = panels
      .map(panel => {
        const placement = layoutManager.getPanelPlacement(panel.id);
        
        // Skip rendering if current layout hides the panel
        if (!placement.visible) return null;

        return h(panel.component, {
          gridClass: placement.className,
          style: placement.style,
          latestFrame,
          latestDecisionFrame
        });
      })
      .filter(Boolean);

    return h('main', { className: 'dashboard-grid-container' }, cardElements);
  }
}
export default DashboardGrid;
