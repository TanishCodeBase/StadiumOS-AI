import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';
import { Sparkline } from './Sparkline.js';

export class MiniTrendChart extends Component {
  render() {
    const { title = '', value = '', trend = '', values = [], color = '#3b82f6' } = this.props;

    const isPositive = !trend.startsWith('-');
    const trendColor = isPositive ? '#10b981' : '#ef4444';

    return h('div', { 
      className: 'viz-mini-trend-chart',
      style: 'display: flex; justify-content: space-between; align-items: center; padding: 6px 0;'
    }, [
      h('div', { style: 'display: flex; flex-direction: column;' }, [
        h('span', { style: 'font-size: 10px; color: #9ca3af;' }, title),
        h('div', { style: 'display: flex; align-items: baseline; gap: 6px;' }, [
          h('span', { style: 'font-size: 14px; font-weight: bold; color: #ffffff;' }, value),
          trend ? h('span', { style: `font-size: 9px; font-weight: bold; color: ${trendColor};` }, trend) : null
        ])
      ]),
      h(Sparkline, { values, width: 60, height: 16, color })
    ]);
  }
}
export default MiniTrendChart;
