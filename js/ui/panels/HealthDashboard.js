import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { Gauge } from '../components/visualizations/Gauge.js';
import { ProgressRing } from '../components/visualizations/ProgressRing.js';
import { Sparkline } from '../components/visualizations/Sparkline.js';
import { StatisticCard } from '../components/visualizations/StatisticCard.js';

export class HealthDashboard extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel) {
      return this.renderCard('System Health', 'STANDBY', 
        h('div', { className: 'placeholder-text' }, 'Awaiting metrics payload...')
      );
    }

    return this.renderCard('System Health', 'HEALTHY', [
      h('div', { style: 'display: flex; justify-content: space-around; align-items: center; padding: 10px 0; border-bottom: 1px solid #1f2937; margin-bottom: 10px;' }, [
        h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 4px;' }, [
          h('span', { style: 'font-size: 9px; color: #9ca3af;' }, 'PIPELINE LATENCY'),
          h(Gauge, { value: Math.min(100, viewModel.pipelineLatencyMs * 10), warningThreshold: 60, criticalThreshold: 80, unit: 'ms' })
        ]),
        h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 4px;' }, [
          h('span', { style: 'font-size: 9px; color: #9ca3af;' }, 'MEMORY UTILIZATION'),
          h(ProgressRing, { value: viewModel.memoryUsedVal, size: 40, strokeWidth: 3, color: '#3b82f6' })
        ])
      ]),

      h('div', { style: 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;' }, [
        h(StatisticCard, {
          title: 'WORKER HEALTH',
          value: viewModel.workerStatus,
          badge: viewModel.simulationState,
          children: [
            h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 10px;' }, [
              h('span', { style: 'color: #9ca3af;' }, 'Latency Trend (Runs)'),
              h(Sparkline, { values: viewModel.latencyHistory, width: 70, height: 14, color: '#10b981' })
            ])
          ]
        })
      ]),

      h('div', { style: 'display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #9ca3af;' }, [
        h('div', { style: 'display: flex; justify-content: space-between; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'FRAME PROCESSING TIME:'),
          h('span', { style: 'color: #ffffff; font-weight: bold;' }, `${viewModel.frameProcessingTimeMs} ms`)
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'FRAME RATE:'),
          h('span', { style: 'color: #ffffff; font-weight: bold;' }, `${viewModel.frameRate} FPS`)
        ]),
        h('div', { style: 'display: flex; justify-content: space-between; border-bottom: 1px solid #1f2937; padding-bottom: 4px;' }, [
          h('span', null, 'ENGINE HEALTH:'),
          h('span', { style: 'color: #10b981; font-weight: bold;' }, viewModel.engineHealth)
        ])
      ])
    ]);
  }
}
export default HealthDashboard;
