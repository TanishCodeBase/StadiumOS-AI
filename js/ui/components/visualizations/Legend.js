import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class Legend extends Component {
  render() {
    const { items = [] } = this.props;

    return h('div', { 
      className: 'viz-legend-container',
      style: 'display: flex; flex-wrap: wrap; gap: 8px;'
    }, 
      items.map(item => 
        h('div', { 
          style: 'display: flex; align-items: center; gap: 4px; font-size: 10px; color: #d1d5db;' 
        }, [
          h('span', { 
            style: `width: 8px; height: 8px; border-radius: 50%; background: ${item.color || '#9ca3af'}; display: inline-block;` 
          }),
          h('span', null, item.label)
        ])
      )
    );
  }
}
export default Legend;
