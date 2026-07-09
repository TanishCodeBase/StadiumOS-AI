import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class HeatLegend extends Component {
  render() {
    const { minLabel = 'Low', maxLabel = 'High', colors = ['#10b981', '#f59e0b', '#ef4444'] } = this.props;

    const gradientBackground = `linear-gradient(to right, ${colors.join(', ')})`;

    return h('div', { 
      className: 'viz-heat-legend',
      style: 'display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 150px;'
    }, [
      h('div', { 
        className: 'legend-gradient-bar',
        style: `width: 100%; height: 8px; background: ${gradientBackground}; border-radius: 4px;`
      }),
      h('div', { 
        className: 'legend-labels',
        style: 'display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af;'
      }, [
        h('span', null, minLabel),
        h('span', null, maxLabel)
      ])
    ]);
  }
}
export default HeatLegend;
