import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class ProgressBar extends Component {
  render() {
    const { value = 0, min = 0, max = 100, color = '#10b981', height = 4, label = '' } = this.props;

    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    return h('div', { 
      className: 'viz-progress-bar-container',
      style: 'width: 100%; display: flex; flex-direction: column; gap: 4px;'
    }, [
      label ? h('div', { style: 'display: flex; justify-content: space-between; font-size: 10px; color: #ffffff;' }, [
        h('span', null, label),
        h('span', { style: 'font-weight: bold;' }, `${percentage.toFixed(0)}%`)
      ]) : null,
      h('div', { 
        className: 'bar-bg',
        style: `width: 100%; height: ${height}px; background: #1f2937; border-radius: 9999px; overflow: hidden;`
      }, [
        h('div', { 
          className: 'bar-fill',
          style: `width: ${percentage}%; height: 100%; background: ${color}; border-radius: 9999px; transition: width 0.3s ease;`
        })
      ])
    ]);
  }
}
export default ProgressBar;
