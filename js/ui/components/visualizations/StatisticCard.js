import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class StatisticCard extends Component {
  render() {
    const { title = '', value = '', badge = '', children = [] } = this.props;

    return h('div', { 
      className: 'viz-statistic-card',
      style: 'border: 1px solid #1f2937; padding: 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px;'
    }, [
      h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' }, [
        h('span', { style: 'font-size: 10px; color: #9ca3af;' }, title),
        badge ? h('span', { style: 'background: rgba(59, 130, 246, 0.15); color: #3b82f6; font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 3px;' }, badge) : null
      ]),
      h('span', { style: 'font-size: 18px; font-weight: bold; color: #ffffff;' }, value),
      children && children.length > 0 ? h('div', { className: 'statistic-children' }, children) : null
    ]);
  }
}
export default StatisticCard;
