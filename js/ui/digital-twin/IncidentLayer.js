import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class IncidentLayer extends Component {
  render() {
    const { nodes, coords } = this.props;
    if (!nodes || nodes.length === 0) return h('g');

    const settings = StadiumGeometry.VisualSettings?.incidents || { opacity: '0.95', radius: '7' };
    const baseRadius = parseFloat(settings.radius);

    return h('g', { 
      className: 'layer-incidents',
      style: `opacity: ${settings.opacity}; pointer-events: none;`
    },
      nodes.map(node => {
        const screenPt = coords.worldToScreen(node.position.x, node.position.y);
        const severity = node.metadata.severity || 'LOW';
        
        let color = '#3b82f6'; // Low (Blue)
        let pulseDur = '0s';   // Low has no animation (static)
        let pulseOpacity = '0';
        
        if (severity === 'HIGH') {
          color = '#ef4444'; // Red
          pulseDur = '1.2s';
          pulseOpacity = '0.35';
        } else if (severity === 'MEDIUM') {
          color = '#f59e0b'; // Orange
          pulseDur = '2.2s';
          pulseOpacity = '0.2';
        }

        const isAnimated = pulseDur !== '0s';

        return h('g', {
          key: node.id,
          className: `incident-marker incident-${severity.toLowerCase()}`
        }, [
          // Pulse Ring (animated for HIGH/MEDIUM, static or omitted for LOW)
          isAnimated ? h('circle', {
            cx: screenPt.x,
            cy: screenPt.y,
            r: baseRadius * 2,
            fill: color,
            fillOpacity: pulseOpacity,
            stroke: color,
            strokeWidth: '1.5'
          }, [
            h('animate', {
              attributeName: 'r',
              values: `${baseRadius};${baseRadius * 3}`,
              dur: pulseDur,
              repeatCount: 'indefinite'
            }),
            h('animate', {
              attributeName: 'opacity',
              values: '1;0',
              dur: pulseDur,
              repeatCount: 'indefinite'
            })
          ]) : h('circle', {
            cx: screenPt.x,
            cy: screenPt.y,
            r: baseRadius * 1.5,
            fill: color,
            fillOpacity: '0.1',
            stroke: color,
            strokeWidth: '1',
            strokeDasharray: '2,2'
          }),

          // Central Marker Circle
          h('circle', {
            cx: screenPt.x,
            cy: screenPt.y,
            r: baseRadius,
            fill: color,
            stroke: '#ffffff',
            strokeWidth: '1.5'
          }),

          // Exclamation Mark text
          h('text', {
            x: screenPt.x,
            y: screenPt.y + baseRadius / 2 + 0.5,
            fill: '#ffffff',
            fontSize: `${baseRadius * 1.3}px`,
            fontWeight: 'bold',
            textAnchor: 'middle',
            style: 'font-family: monospace; font-weight: 900;'
          }, '!')
        ]);
      })
    );
  }
}

export default IncidentLayer;
