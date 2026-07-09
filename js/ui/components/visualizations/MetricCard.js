import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class MetricCard extends Component {
  render() {
    const { title = '', value = '', subtitle = '', trend = '', color = '' } = this.props;

    const valueStyle = color ? `font-size: 16px; font-weight: bold; color: ${color};` : 'font-size: 16px; font-weight: bold; color: #ffffff;';

    return h('div', { 
      className: 'viz-metric-card',
      style: 'border: 1px solid #1f2937; padding: 10px; border-radius: 4px; background: rgba(17, 24, 39, 0.3); display: flex; flex-direction: column; gap: 4px;'
    }, [
      h('span', { style: 'font-size: 10px; color: #9ca3af; text-transform: uppercase;' }, title),
      h('div', { style: 'display: flex; align-items: baseline; justify-content: space-between;' }, [
        h('span', { style: valueStyle }, value),
        trend ? h('span', { style: 'font-size: 9px; font-weight: bold; color: #10b981;' }, trend) : null
      ]),
      subtitle ? h('span', { style: 'font-size: 9px; color: #6b7280;' }, subtitle) : null
    ]);
  }
}
export default MetricCard;
