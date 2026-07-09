import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class PersonnelLayer extends Component {
  render() {
    const { nodes, coords, selectedPersonnelId } = this.props;
    if (!nodes || nodes.length === 0) return h('g');

    const settings = StadiumGeometry.VisualSettings?.personnel || { opacity: '0.90', radius: '5' };
    const baseRadius = parseFloat(settings.radius);

    return h('g', { 
      className: 'layer-personnel-markers',
      style: `opacity: ${settings.opacity};`
    }, 
      nodes.map(node => {
        const isSelected = selectedPersonnelId === node.id;
        
        // Marker type color picker
        let color = '#6b7280';
        switch (node.metadata.type) {
          case 'MEDICAL': color = '#ec4899'; break;
          case 'SECURITY': color = '#3b82f6'; break;
          case 'FIRE': color = '#f97316'; break;
          case 'STAFF': color = '#eab308'; break;
        }

        // Marker status border color picker
        const strokeColor = node.metadata.status === 'AVAILABLE' ? '#10b981' : '#ef4444';

        const screenPt = coords.worldToScreen(node.position.x, node.position.y);

        // Render marker group translated in 3D with ease-in-out transition to allow smooth sliding updates
        return h('g', {
          key: node.id,
          className: 'personnel-marker-group',
          style: `pointer-events: none; transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1); transform: translate3d(${screenPt.x}px, ${screenPt.y}px, 0);`
        }, [
          isSelected ? h('circle', {
            cx: 0,
            cy: 0,
            r: baseRadius * 2,
            fill: color,
            fillOpacity: '0.3',
            stroke: color,
            strokeWidth: '1'
          }) : null,

          h('circle', {
            cx: 0,
            cy: 0,
            r: baseRadius,
            fill: color,
            stroke: strokeColor,
            strokeWidth: '2',
            'aria-label': `Responder ${node.id} type ${node.metadata.type}`,
            tabindex: '0'
          }),

          h('text', {
            x: 0,
            y: baseRadius / 2,
            fill: '#ffffff',
            fontSize: `${baseRadius * 1.3}px`,
            fontWeight: 'bold',
            textAnchor: 'middle'
          }, (node.metadata.type || 'S').charAt(0))
        ]);
      })
    );
  }
}
export default PersonnelLayer;
