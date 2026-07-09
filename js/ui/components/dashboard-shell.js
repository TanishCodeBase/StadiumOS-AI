import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { Header } from './header.js';
import { DashboardGrid } from './dashboard-grid.js';
import { StatusBar } from './status-bar.js';

export class DashboardShell extends Component {
  render() {
    return h('div', { className: 'app-container' }, [
      h(Header),
      h(DashboardGrid),
      h(StatusBar)
    ]);
  }
}
