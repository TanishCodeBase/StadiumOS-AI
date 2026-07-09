import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class GateLayer extends Component {
  render() {
    const { nodes, coords, selectedGateId, showCameras } = this.props;
    const { securityCheckpoints, cameras } = StadiumGeometry;

    return h('g', { className: 'layer-infrastructure-gates' }, [
      // 1. Render Gates from SceneNodes
      h('g', { className: 'gates-group' }, 
        (nodes || []).map(node => {
          const isSelected = selectedGateId === node.id;
          const pt = coords.worldToScreen(node.position.x, node.position.y);
          const labelCode = (node.metadata.code || 'G').replace('GATE-', '');

          return h('g', {
            key: node.id,
            className: 'gate-node',
            style: 'pointer-events: none;' // click bubbles up to main viewport hit tester
          }, [
            h('rect', {
              x: pt.x - 12,
              y: pt.y - 12,
              width: 24,
              height: 24,
              rx: 4,
              fill: '#4b5563',
              stroke: isSelected ? '#ffffff' : '#9ca3af',
              strokeWidth: isSelected ? '2' : '1'
            }),
            h('text', {
              x: pt.x,
              y: pt.y + 4,
              fill: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold',
              textAnchor: 'middle'
            }, labelCode)
          ]);
        })
      ),

      // 2. Render Security Checkpoints
      h('g', { className: 'checkpoints-group' }, 
        securityCheckpoints.map(cp => {
          const pt = coords.worldToScreen(cp.x, cp.y);

          return h('circle', {
            key: cp.id || cp.label,
            cx: pt.x,
            cy: pt.y,
            r: 5,
            fill: '#d97706',
            stroke: '#fbbf24',
            strokeWidth: '1',
            'aria-label': cp.label
          });
        })
      ),

      // 3. Render Cameras
      showCameras ? h('g', { className: 'cameras-group' }, 
        cameras.map(c => {
          const pt = coords.worldToScreen(c.x, c.y);

          return h('polygon', {
            key: c.id || c.label,
            points: `${pt.x},${pt.y - 4} ${pt.x - 4},${pt.y + 4} ${pt.x + 4},${pt.y + 4}`,
            fill: '#ef4444',
            stroke: '#f87171',
            strokeWidth: '1',
            'aria-label': c.label
          });
        })
      ) : null
    ]);
  }
}
export default GateLayer;
