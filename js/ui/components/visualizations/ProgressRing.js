import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class ProgressRing extends Component {
  render() {
    const { value = 0, min = 0, max = 100, size = 36, strokeWidth = 4, label = '', color = '#10b981' } = this.props;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return h('div', { 
      className: 'viz-progress-ring-container',
      style: 'display: inline-flex; flex-direction: column; align-items: center;'
    }, [
      h('svg', {
        width: size,
        height: size,
        className: 'viz-progress-ring',
        'aria-label': `Progress: ${percentage.toFixed(0)}%`,
        role: 'img'
      }, [
        h('circle', {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          className: 'ring-bg',
          stroke: '#1f2937',
          strokeWidth: strokeWidth,
          fill: 'none'
        }),
        h('circle', {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          className: 'ring-fill',
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'none',
          strokeDasharray: circumference,
          strokeDashoffset: strokeDashoffset,
          strokeLinecap: 'round',
          transform: `rotate(-90 ${size / 2} ${size / 2})`
        }),
        h('text', {
          x: '50%',
          y: '50%',
          dy: '.3em',
          textAnchor: 'middle',
          className: 'ring-text',
          fill: '#ffffff',
          fontSize: `${size * 0.22}px`,
          fontWeight: 'bold'
        }, `${percentage.toFixed(0)}%`)
      ]),
      label ? h('span', { className: 'viz-label', style: 'font-size: 10px; color: #9ca3af; margin-top: 4px;' }, label) : null
    ]);
  }
}
export default ProgressRing;
