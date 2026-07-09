import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class Gauge extends Component {
  render() {
    const { value = 0, warningThreshold = 60, criticalThreshold = 80, unit = '%' } = this.props;

    const angle = (Math.min(100, Math.max(0, value)) / 100) * Math.PI; // 0 to 180 degrees in radians
    const needleX = 50 + 40 * Math.cos(Math.PI - angle);
    const needleY = 50 - 40 * Math.sin(Math.PI - angle);

    let color = '#10b981'; // Green
    if (value >= criticalThreshold) color = '#ef4444'; // Red
    else if (value >= warningThreshold) color = '#f59e0b'; // Orange

    return h('div', { 
      className: 'viz-gauge-container',
      style: 'display: flex; flex-direction: column; align-items: center;'
    }, [
      h('svg', {
        width: '100',
        height: '60',
        className: 'viz-gauge',
        'aria-label': `Gauge reading: ${value}${unit}`,
        role: 'img'
      }, [
        // Arc background
        h('path', {
          d: 'M 10 50 A 40 40 0 0 1 90 50',
          fill: 'none',
          stroke: '#1f2937',
          strokeWidth: '8',
          strokeLinecap: 'round'
        }),
        // Arc fill color track
        h('path', {
          d: `M 10 50 A 40 40 0 0 1 90 50`,
          fill: 'none',
          stroke: color,
          strokeWidth: '8',
          strokeLinecap: 'round',
          strokeOpacity: '0.3'
        }),
        // Center pin circle
        h('circle', {
          cx: '50',
          cy: '50',
          r: '5',
          fill: '#ffffff'
        }),
        // Needle line
        h('line', {
          x1: '50',
          y1: '50',
          x2: needleX,
          y2: needleY,
          stroke: '#ffffff',
          strokeWidth: '2.5',
          strokeLinecap: 'round'
        }),
        // Bottom reading label text
        h('text', {
          x: '50',
          y: '58',
          textAnchor: 'middle',
          fill: '#ffffff',
          fontSize: '9px',
          fontWeight: 'bold'
        }, `${value}${unit}`)
      ])
    ]);
  }
}
export default Gauge;
