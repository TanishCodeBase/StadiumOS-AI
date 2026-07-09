import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { ExecutiveOverviewViewModel } from '../viewmodels/ExecutiveOverviewViewModel.js';

export class ExecutiveOverview extends Component {
  render() {
    const { latestFrame, latestDecisionFrame } = this.props;
    const vm = new ExecutiveOverviewViewModel(latestFrame, latestDecisionFrame);

    const kpis = [
      {
        title: 'Stadium Occupancy',
        value: vm.occupancy > 0 ? `${vm.occupancy}%` : '—',
        trend: vm.occupancyTrend,
        icon: '👥',
        color: vm.occupancy > 80 ? '#ef4444' : vm.occupancy > 50 ? '#f59e0b' : '#10b981'
      },
      {
        title: 'Active Incidents',
        value: String(vm.activeIncidentsCount),
        trend: vm.incidentsSeverityText,
        icon: '⚠️',
        color: vm.activeIncidentsCount > 0 ? '#ef4444' : '#10b981'
      },
      {
        title: 'Threat Level',
        value: vm.threatLevel,
        trend: vm.threatTrend,
        icon: '🛡️',
        color: vm.threatLevel === 'HIGH' ? '#ef4444' : vm.threatLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
      },
      {
        title: 'Active Responders',
        value: String(vm.totalResponders),
        trend: `${vm.activeResponders} Active`,
        icon: '👮',
        color: '#3b82f6'
      },
      {
        title: 'Prediction Confidence',
        value: vm.predictionConfidence > 0 ? `${vm.predictionConfidence}%` : '—',
        trend: vm.predictionConfidenceText,
        icon: '🧠',
        color: vm.predictionConfidence > 80 ? '#10b981' : '#3b82f6'
      },
      {
        title: 'Avg Response Time',
        value: vm.averageResponseTimeText,
        trend: vm.responseTimeTrend,
        icon: '⏱️',
        color: '#eab308'
      }
    ];

    return h('div', { 
      className: 'executive-overview-ribbon'
    }, 
      kpis.map((kpi, idx) => 
        h('div', { 
          key: idx,
          className: 'kpi-ribbon-block'
        }, [
          h('div', { className: 'kpi-block-details' }, [
            h('span', { className: 'kpi-block-title' }, kpi.title),
            h('span', { className: 'kpi-block-value', style: `color: ${kpi.color};` }, kpi.value),
            h('span', { className: 'kpi-block-trend' }, kpi.trend)
          ]),
          h('span', { className: 'kpi-block-icon' }, kpi.icon)
        ])
      )
    );
  }
}

export default ExecutiveOverview;
