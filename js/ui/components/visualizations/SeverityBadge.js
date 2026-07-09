import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class SeverityBadge extends Component {
  render() {
    const { severity = 'LOW', label = '' } = this.props;

    let bg = '#374151';
    let text = '#9ca3af';

    const normalized = (severity || '').toUpperCase();
    if (normalized === 'LOW') {
      bg = 'rgba(59, 130, 246, 0.15)';
      text = '#3b82f6';
    } else if (normalized === 'MEDIUM') {
      bg = 'rgba(234, 179, 8, 0.15)';
      text = '#eab308';
    } else if (normalized === 'HIGH') {
      bg = 'rgba(249, 115, 22, 0.15)';
      text = '#f97316';
    } else if (normalized === 'CRITICAL') {
      bg = 'rgba(239, 68, 68, 0.15)';
      text = '#ef4444';
    }

    return h('span', { 
      className: `viz-severity-badge severity-${normalized.toLowerCase()}`,
      style: `display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 3px; background: ${bg}; color: ${text}; font-size: 8px; font-weight: bold; text-transform: uppercase;`
    }, label || severity);
  }
}
export default SeverityBadge;
