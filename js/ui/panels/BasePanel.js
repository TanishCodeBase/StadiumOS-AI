import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';

export class BasePanel extends Component {
  /**
   * Helper to render a card frame.
   */
  renderCard(title, badge, children) {
    const { gridClass, style } = this.props;
    return h('div', { 
      className: `dashboard-card ${gridClass || ''}`,
      style: style || ''
    }, [
      h('div', { className: 'card-header' }, [
        h('div', { className: 'card-header-main' }, [
          h('span', { className: 'card-status-dot' }),
          h('h3', { className: 'card-title' }, title)
        ]),
        h('div', { className: 'card-header-actions' }, [
          h('span', { className: 'card-badge' }, badge)
        ])
      ]),
      h('div', { className: 'card-body-scroll' }, children)
    ]);
  }
}
export default BasePanel;
