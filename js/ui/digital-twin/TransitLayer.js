import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class TransitLayer extends Component {
  render() {
    const { viewModel, coords } = this.props;
    const { transitCorridors } = StadiumGeometry;

        const settings = StadiumGeometry.VisualSettings?.transit || { strokeWidth: '2.0', stopRadius: '4.0' };
        const baseWidth = parseFloat(settings.strokeWidth);
        const stopR = parseFloat(settings.stopRadius);

        return h('g', { className: 'layer-transit-corridors' }, 
          transitCorridors.map((tc, idx) => {
            // Retrieve dynamic route properties from TransitViewModel matching line indexes
            const routeData = viewModel && viewModel.routes ? viewModel.routes[idx] : null;
            const color = viewModel && routeData
              ? viewModel.getRouteStatusColor(routeData.status)
              : '#4b5563';

            // Transform world coordinate endpoints to screen coordinates
            const pt1 = coords.worldToScreen(tc.x1, tc.y1);
            const pt2 = coords.worldToScreen(tc.x2, tc.y2);

            const isSecondary = idx % 2 === 1;

            // Subtle arrow pointing direction of flow (midpoint)
            const midX = (pt1.x + pt2.x) / 2;
            const midY = (pt1.y + pt2.y) / 2;
            const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180 / Math.PI;

            return h('g', { key: tc.id, className: 'transit-corridor-network' }, [
              // Corridor Line
              h('line', {
                x1: pt1.x,
                y1: pt1.y,
                x2: pt2.x,
                y2: pt2.y,
                stroke: color,
                strokeWidth: isSecondary ? baseWidth : baseWidth * 1.2,
                strokeDasharray: isSecondary ? '4,4' : 'none',
                strokeLinecap: 'round',
                strokeOpacity: '0.85',
                'aria-label': tc.label
              }),
              
              // Direction Arrow
              h('polygon', {
                points: '-4,-3 3,0 -4,3',
                fill: color,
                fillOpacity: '0.8',
                transform: `translate(${midX}, ${midY}) rotate(${angle})`
              }),

              // Station stop node 1 (Perimeter Gate)
              h('circle', {
                cx: pt1.x,
                cy: pt1.y,
                r: stopR,
                fill: '#0b0f19',
                stroke: color,
                strokeWidth: '1.5'
              }),

              // Station stop node 2 (Outer Terminal)
              h('circle', {
                cx: pt2.x,
                cy: pt2.y,
                r: stopR,
                fill: '#0b0f19',
                stroke: color,
                strokeWidth: '1.5'
              })
            ]);
          })
        );
  }
}
export default TransitLayer;
