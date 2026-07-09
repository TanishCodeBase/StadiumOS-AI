import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class StatusChip extends Component {
  render() {
    const { status = '', icon = '', label = '' } = this.props;

    let bg = '#1f2937';
    let text = '#ffffff';

    const normalized = (status || '').toUpperCase();
    if (normalized === 'HEALTHY' || normalized === 'NOMINAL' || normalized === 'AVAILABLE') {
      bg = 'rgba(16, 185, 129, 0.15)';
      text = '#10b981';
    } else if (normalized === 'DEGRADED' || normalized === 'WARNING' || normalized === 'BUSY' || normalized === 'DELAYED') {
      bg = 'rgba(245, 158, 11, 0.15)';
      text = '#f59e0b';
    } else if (normalized === 'CRITICAL' || normalized === 'ERROR' || normalized === 'SUSPENDED') {
      bg = 'rgba(239, 68, 68, 0.15)';
      text = '#ef4444';
    }

    return h('div', { 
      className: 'viz-status-chip',
      style: `display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 9999px; background: ${bg}; color: ${text}; font-size: 10px; font-weight: bold;`
    }, [
      icon ? h('span', { className: 'chip-icon' }, icon) : null,
      h('span', { className: 'chip-label' }, label || status)
    ]);
  }
}
export default StatusChip;
