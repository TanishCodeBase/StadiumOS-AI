import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { StatusChip } from '../components/visualizations/StatusChip.js';
import { SeverityBadge } from '../components/visualizations/SeverityBadge.js';
import { MetricCard } from '../components/visualizations/MetricCard.js';

export class EmergencyConsole extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || viewModel.resources.length === 0) {
      return this.renderCard('Emergency Dispatch', 'STANDBY', 
        h('div', { className: 'placeholder-text' }, 'Awaiting responders allocation status...')
      );
    }

    return this.renderCard('Emergency Dispatch', 'ACTIVE', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px;' }, [
        h(MetricCard, {
          title: 'NEAREST RESPONSE',
          value: viewModel.nearestResponseZone,
          subtitle: 'Active checkpoint area'
        }),
        h(MetricCard, {
          title: 'EST DISPATCH DELAY',
          value: `${viewModel.estimatedDispatchTimeSec}s`,
          subtitle: 'Dispatch latency rate',
          color: '#ef4444'
        })
      ]),

      h('div', { className: 'emergency-resources-list', style: 'display: flex; flex-direction: column; gap: 8px;' }, 
        viewModel.resources.map(res => 
          h('div', { 
            className: 'resource-row',
            style: 'display: flex; justify-content: space-between; align-items: center; font-size: 11px; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' 
          }, [
            h('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
              h(SeverityBadge, { severity: res.type === 'FIRE' ? 'HIGH' : 'LOW', label: res.type }),
              h('span', { style: 'font-weight: bold; color: #ffffff;' }, `UNITS: ${res.count}`)
            ]),
            h(StatusChip, { status: res.status })
          ])
        )
      ),

      h('div', { className: 'dispatch-actions', style: 'margin-top: 12px; display: flex; flex-direction: column; gap: 6px;' }, [
        h('span', { style: 'font-size: 9px; font-weight: bold; color: #9ca3af;' }, 'DISPATCH CHANNELS'),
        h('div', { style: 'display: flex; gap: 4px;' }, [
          h('button', {
            className: 'btn-noc',
            style: 'font-size: 9px; padding: 4px 6px; flex: 1;',
            onClick: () => console.log('Dispatched Medical Rescue Unit')
          }, 'DEPLOY MED'),
          h('button', {
            className: 'btn-noc',
            style: 'font-size: 9px; padding: 4px 6px; flex: 1;',
            onClick: () => console.log('Dispatched Security Detail Unit')
          }, 'DEPLOY SEC'),
          h('button', {
            className: 'btn-noc',
            style: 'font-size: 9px; padding: 4px 6px; flex: 1;',
            onClick: () => console.log('Dispatched Fire Engine Unit')
          }, 'DEPLOY FIRE')
        ])
      ])
    ]);
  }
}
export default EmergencyConsole;
