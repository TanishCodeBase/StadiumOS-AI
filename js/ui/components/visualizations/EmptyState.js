import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class EmptyState extends Component {
  render() {
    const { message = 'No data available.', icon = '📭' } = this.props;

    return h('div', { 
      className: 'viz-empty-state',
      style: 'display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; color: #4b5563; border: 1px dashed #1f2937; border-radius: 4px;'
    }, [
      h('span', { style: 'font-size: 24px; margin-bottom: 6px;' }, icon),
      h('span', { style: 'font-size: 11px; color: #9ca3af;' }, message)
    ]);
  }
}
export default EmptyState;
