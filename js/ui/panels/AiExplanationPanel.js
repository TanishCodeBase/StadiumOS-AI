import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { EmptyState } from '../components/visualizations/EmptyState.js';

export class AiExplanationPanel extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || !viewModel.recommendations || viewModel.recommendations.length === 0) {
      return this.renderCard('AI Decision Support', 'NOMINAL', 
        h(EmptyState, { message: 'No active AI recommendations requiring explanation.', icon: '🧠' })
      );
    }

    const rec = viewModel.recommendations[0];

    return this.renderCard('AI Decision Support', `ID: ${rec.decisionId.substring(0, 8)}`, [
      h('div', { 
        className: 'ai-explanation-content',
        style: 'padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; height: 100%; overflow-y: auto;' 
      }, [
        // 1. Recommendation Header Title
        h('div', { className: 'ai-explanation-header' }, [
          h('span', { style: 'font-family: var(--font-mono); font-size: 9px; color: var(--color-primary); font-weight: bold; letter-spacing: 0.05em;' }, 'ACTIVE AI DISPATCH SUGGESTION'),
          h('h4', { style: 'margin: 4px 0 0 0; font-size: 13px; font-weight: bold; color: #ffffff;' }, rec.action)
        ]),

        // 2. Situation Summary
        h('div', { className: 'explanation-section', style: 'background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 4px; padding: 10px;' }, [
          h('span', { style: 'font-family: var(--font-mono); font-size: 9px; color: #9ca3af; font-weight: bold;' }, 'CONTEXTUAL SITUATION'),
          h('p', { style: 'margin: 4px 0 0 0; font-size: 11px; color: #d1d5db; line-height: 1.4;' }, rec.situation)
        ]),

        // 3. Reasoning Chains
        h('div', { className: 'explanation-section' }, [
          h('span', { style: 'font-family: var(--font-mono); font-size: 9px; color: #9ca3af; font-weight: bold;' }, 'REASONING & EVIDENCE CHAIN'),
          h('ul', { style: 'margin: 6px 0 0 0; padding-left: 14px; display: flex; flex-direction: column; gap: 4px;' }, 
            rec.evidence.concat(rec.reason).map((item, idx) => 
              h('li', { key: idx, style: 'font-size: 11px; color: #d1d5db; line-height: 1.4;' }, item)
            )
          )
        ]),

        // 4. Expected Performance Impacts Grid
        h('div', { className: 'explanation-section' }, [
          h('span', { style: 'font-family: var(--font-mono); font-size: 9px; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 6px;' }, 'FORECASTED PERFORMANCE IMPACT'),
          h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;' }, 
            rec.impact.map((imp, idx) => {
              let labelColor = '#d1d5db';
              let badgeColor = 'rgba(6, 182, 212, 0.1)';
              let textColor = 'var(--color-primary)';
              
              if (imp.label.toLowerCase().includes('risk')) {
                badgeColor = 'rgba(239, 68, 68, 0.1)';
                textColor = '#ef4444';
              }

              return h('div', { 
                key: idx, 
                style: `background: ${badgeColor}; border: 1px solid rgba(255,255,255,0.02); border-radius: 4px; padding: 6px 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px;` 
              }, [
                h('span', { style: `font-size: 11px; font-weight: bold; color: ${textColor};` }, imp.change),
                h('span', { style: 'font-size: 8px; font-family: var(--font-mono); color: #9ca3af; letter-spacing: 0.02em; text-transform: uppercase;' }, imp.label)
              ]);
            })
          )
        ]),

        // 5. Confidence Score and Prediction Horizon Footer Strip
        h('div', { 
          style: 'border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-family: var(--font-mono); color: #9ca3af;' 
        }, [
          h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
            h('span', null, 'CONFIDENCE:'),
            h('span', { style: 'color: #10b981; font-weight: bold;' }, `${rec.confidence}%`)
          ]),
          h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
            h('span', null, 'HORIZON:'),
            h('span', { style: 'color: #ffffff;' }, rec.horizon)
          ])
        ])
      ])
    ]);
  }
}

export default AiExplanationPanel;
