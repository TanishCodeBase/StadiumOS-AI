import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { MetricCard } from '../components/visualizations/MetricCard.js';
import { ProgressBar } from '../components/visualizations/ProgressBar.js';
import { StatusChip } from '../components/visualizations/StatusChip.js';
import { EmptyState } from '../components/visualizations/EmptyState.js';

export class VolunteerPanel extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || viewModel.sectors.length === 0) {
      return this.renderCard('Volunteer Staffing', 'STANDBY', 
        h(EmptyState, { message: 'Awaiting volunteer allocations telemetry.', icon: '👥' })
      );
    }

    return this.renderCard('Volunteer Staffing', `DEPLOYED: ${viewModel.deploymentPercent}%`, [
      h('div', { style: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px;' }, [
        h(MetricCard, {
          title: 'AVAILABLE VOLUNTEERS',
          value: `${viewModel.totalAvailable} pax`,
          subtitle: 'Active roster total'
        }),
        h(MetricCard, {
          title: 'ASSIGNED VOLUNTEERS',
          value: `${viewModel.totalAssigned} pax`,
          subtitle: 'Deployed in stands',
          color: '#10b981'
        })
      ]),

      h('div', { className: 'volunteer-sectors-list', style: 'display: flex; flex-direction: column; gap: 8px;' }, 
        viewModel.sectors.map(v => 
          h('div', { 
            className: 'sector-box',
            style: 'border: 1px solid #1f2937; padding: 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px;' 
          }, [
            h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' }, [
              h('span', { style: 'font-size: 11px; font-weight: bold; color: #ffffff;' }, v.sector),
              h(StatusChip, { status: v.readinessStatus })
            ]),
            h(ProgressBar, {
              value: v.deploymentPercent,
              min: 0,
              max: 100,
              color: '#3b82f6',
              height: 3,
              label: `Sector Deployment Rate (Standby: ${v.standby})`
            })
          ])
        )
      )
    ]);
  }
}
export default VolunteerPanel;
