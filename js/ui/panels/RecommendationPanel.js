import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { ConfidenceRing } from '../components/visualizations/ConfidenceRing.js';
import { SeverityBadge } from '../components/visualizations/SeverityBadge.js';
import { EmptyState } from '../components/visualizations/EmptyState.js';

export class RecommendationPanel extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || !viewModel.recommendations || viewModel.recommendations.length === 0) {
      return this.renderCard('AI Recommendations', 'STANDBY', 
        h(EmptyState, { message: 'No active AI operational recommendation alerts.', icon: '🧠' })
      );
    }

    return this.renderCard('AI Recommendations', `CONF: ${Math.round(viewModel.overallConfidence * 100)}%`, [
      // Compact NOC Summary Ratios
      h('div', { 
        style: 'display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #1f2937; margin-bottom: 8px; background: rgba(255,255,255,0.01);' 
      }, [
        h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
          h('span', { style: 'font-size: 9px; font-family: var(--font-mono); color: #9ca3af; letter-spacing: 0.05em;' }, 'NOC ENGINE THREAT:'),
          h('span', { 
            style: `font-size: 10px; font-family: var(--font-mono); font-weight: bold; padding: 2px 6px; border-radius: 3px; background: ${viewModel.threatLevel === 'LOW' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'}; color: ${viewModel.threatLevel === 'LOW' ? '#10b981' : '#f59e0b'};` 
          }, viewModel.threatLevel)
        ]),
        h('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
          h('span', { style: 'font-size: 9px; font-family: var(--font-mono); color: #9ca3af;' }, 'CONF:'),
          h(ConfidenceRing, { value: viewModel.overallConfidence, size: 28 })
        ])
      ]),

      // Compact scannable list
      h('div', { className: 'recommendations-list', style: 'padding: 0 10px; display: flex; flex-direction: column; gap: 8px;' }, 
        viewModel.recommendations.map(rec => 
          h('div', { 
            key: rec.id,
            className: 'recommendation-box',
            style: 'border: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.015); padding: 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s;' 
          }, [
            h('div', { className: 'rec-header', style: 'display: flex; justify-content: space-between; align-items: center;' }, [
              h(SeverityBadge, { severity: rec.type.includes('CROWD') ? 'MEDIUM' : 'HIGH', label: rec.type }),
              h('span', { style: 'color: #9ca3af; font-family: var(--font-mono); font-size: 9px;' }, rec.generatedBy)
            ]),
            
            // Contextual short action title
            h('p', { style: 'margin: 0; font-size: 11.5px; font-weight: 500; color: #ffffff; line-height: 1.3;' }, rec.action),
            
            // Expected impacts badge list
            h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px;' }, 
              rec.impact.map((imp, idx) => 
                h('span', { 
                  key: idx,
                  style: 'font-size: 8.5px; font-family: var(--font-mono); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px; color: #d1d5db;' 
                }, `${imp.label}: ${imp.change}`)
              )
            ),

            // Accept/Dismiss actions
            h('div', { style: 'display: flex; gap: 6px; margin-top: 4px;' }, [
              h('button', { 
                className: 'btn-noc', 
                style: 'font-size: 9px; padding: 4px 8px; flex: 1; font-weight: bold;',
                onClick: () => console.log(`Accepted decision: ${rec.decisionId}`)
              }, 'ACCEPT'),
              h('button', { 
                className: 'btn-noc-secondary', 
                style: 'font-size: 9px; padding: 4px 8px; flex: 1; background: #ef4444; border: 1px solid #ef4444; color: white; font-weight: bold;',
                onClick: () => console.log(`Rejected decision: ${rec.decisionId}`)
              }, 'DISMISS')
            ])
          ])
        )
      )
    ]);
  }
}

export default RecommendationPanel;
