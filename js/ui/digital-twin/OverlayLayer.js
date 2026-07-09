import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';

export class OverlayLayer extends Component {
  render() {
    const { selectedItem } = this.props;
    if (!selectedItem) return h('g');

    // Renders selection boundaries or textual details overlays inside the SVG
    return h('g', { className: 'layer-selection-overlays' }, [
      // Outer border highlight
      h('rect', {
        x: 10,
        y: 10,
        width: 180,
        height: 65,
        rx: 6,
        fill: '#111827',
        fillOpacity: '0.90',
        stroke: '#3b82f6',
        strokeWidth: '1.5',
        style: 'pointer-events: none;'
      }),
      h('text', {
        x: 20,
        y: 30,
        fill: '#9ca3af',
        fontSize: '9px',
        fontWeight: 'bold'
      }, 'INSPECTING TARGET'),
      h('text', {
        x: 20,
        y: 45,
        fill: '#ffffff',
        fontSize: '11px',
        fontWeight: 'bold'
      }, selectedItem.id || 'Unknown Entity'),
      h('text', {
        x: 20,
        y: 60,
        fill: '#10b981',
        fontSize: '10px'
      }, selectedItem.info || 'Telemetry parameters nominal')
    ]);
  }
}
export default OverlayLayer;
