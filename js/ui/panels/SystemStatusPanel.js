import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { StatusChip } from '../components/visualizations/StatusChip.js';
import { Gauge } from '../components/visualizations/Gauge.js';
import { StatisticCard } from '../components/visualizations/StatisticCard.js';

export class SystemStatusPanel extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel) {
      return this.renderCard('System Status', 'STANDBY', 
        h('div', { className: 'placeholder-text' }, 'Awaiting status registry details...')
      );
    }

    return this.renderCard('System Status', viewModel.registryHealth, [
      h('div', { style: 'display: flex; justify-content: space-around; align-items: center; padding: 10px 0; border-bottom: 1px solid #1f2937; margin-bottom: 10px;' }, [
        h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 4px;' }, [
          h('span', { style: 'font-size: 9px; color: #9ca3af;' }, 'AVG ENGINE DELAY'),
          h(Gauge, { value: Math.min(100, viewModel.averageEngineLatencyMs * 10), warningThreshold: 60, criticalThreshold: 80, unit: 'ms' })
        ]),
        h(StatisticCard, {
          title: 'SERVICES STACK',
          value: `${viewModel.healthyServicesCount}/${viewModel.registeredServicesCount}`,
          badge: 'ONLINE'
        })
      ]),

      h('div', { className: 'system-metadata', style: 'display: flex; flex-direction: column; gap: 6px; font-size: 11px; margin-bottom: 12px;' }, [
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'VERSION:'),
          h('span', { style: 'color: #ffffff;' }, viewModel.version)
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'ENVIRONMENT:'),
          h('span', { style: 'color: #ffffff;' }, viewModel.env)
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'WORKER INSTANCE:'),
          h(StatusChip, { status: viewModel.workerState })
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'PIPELINE STATS:'),
          h(StatusChip, { status: viewModel.pipelineStatus })
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'SIMULATION STATUS:'),
          h(StatusChip, { status: viewModel.simulationStatus })
        ])
      ]),

      h('div', { className: 'engine-runtimes-list', style: 'display: flex; flex-direction: column; gap: 4px;' }, [
        h('span', { style: 'font-size: 9px; font-weight: bold; color: #9ca3af; margin-bottom: 4px;' }, 'AI ENGINE LATENCIES'),
        viewModel.trackedEngines.map(eng => 
          h('div', { 
            style: 'display: flex; justify-content: space-between; font-size: 10px; border-bottom: 1px dashed #1f2937; padding-bottom: 2px;' 
          }, [
            h('span', null, eng.id),
            h('span', null, `${eng.averageMs.toFixed(2)}ms (Runs: ${eng.count})`)
          ])
        )
      ])
    ]);
  }
}
export default SystemStatusPanel;
