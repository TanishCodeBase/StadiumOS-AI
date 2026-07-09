import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class Sparkline extends Component {
  render() {
    const { values = [], width = 80, height = 20, color = '#3b82f6' } = this.props;

    if (values.length < 2) {
      return h('div', { style: `width: ${width}px; height: ${height}px; color: #4b5563;` }, '—');
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    return h('svg', {
      width: width,
      height: height,
      className: 'viz-sparkline',
      'aria-label': `Sparkline trend: range ${min} to ${max}`,
      role: 'img'
    }, [
      h('path', {
        d: pathData,
        fill: 'none',
        stroke: color,
        strokeWidth: '1.5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      })
    ]);
  }
}
export default Sparkline;
