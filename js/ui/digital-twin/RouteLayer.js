import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class RouteLayer extends Component {
  render() {
    const { nodes, routing, coords } = this.props;
    if ((!nodes || nodes.length === 0) && (!routing || Object.keys(routing).length === 0)) {
      return h('g');
    }

    const settings = StadiumGeometry.VisualSettings?.routes || { strokeWidth: '2.5', opacity: '0.55' };
    const baseWidth = parseFloat(settings.strokeWidth);

    return h('g', { 
      className: 'layer-ai-routes',
      style: `opacity: ${settings.opacity};`
    }, [
      // 1. Static Advisory Routes (from recommendation nodes)
      nodes ? nodes.map(node => {
        let fromPt, toPt;
        const type = node.metadata.type || '';
        
        if (type.includes('CROWD') || type.includes('DIVERSION')) {
          fromPt = coords.worldToScreen(300, 150);
          toPt = coords.worldToScreen(300, 90);
        } else {
          fromPt = coords.worldToScreen(300, 250);
          toPt = coords.worldToScreen(495, 250);
        }

        return h('g', { key: node.id, className: 'ai-advisory-route' }, [
          h('line', {
            x1: fromPt.x,
            y1: fromPt.y,
            x2: toPt.x,
            y2: toPt.y,
            stroke: '#3b82f6', // Static blue for advisory
            strokeWidth: baseWidth,
            strokeDasharray: '5,5',
            strokeLinecap: 'round',
            strokeOpacity: '0.8'
          }),
          h('polygon', {
            points: `${toPt.x - 4},${toPt.y - 4} ${toPt.x + 4},${toPt.y} ${toPt.x - 4},${toPt.y + 4}`,
            fill: '#3b82f6'
          })
        ]);
      }) : null,

      // 2. Active Emergency Dispatch Routes (from routing telemetry vectors)
      routing ? Object.entries(routing).map(([incidentId, route]) => {
        const fromPt = coords.worldToScreen(route.origin.x, route.origin.y);
        const toPt = coords.worldToScreen(route.destination.x, route.destination.y);

        // Emergency route is red and animated
        return h('g', { key: `dispatch-${incidentId}`, className: 'ai-emergency-route' }, [
          h('line', {
            x1: fromPt.x,
            y1: fromPt.y,
            x2: toPt.x,
            y2: toPt.y,
            stroke: '#ef4444', // Red for emergency dispatch
            strokeWidth: baseWidth * 1.2,
            strokeDasharray: '6,6',
            strokeLinecap: 'round',
            className: 'route-line-animated',
            strokeOpacity: '0.9'
          }),
          h('polygon', {
            points: `${toPt.x - 5},${toPt.y - 5} ${toPt.x + 5},${toPt.y} ${toPt.x - 5},${toPt.y + 5}`,
            fill: '#ef4444'
          })
        ]);
      }) : null
    ]);
  }
}

export default RouteLayer;
