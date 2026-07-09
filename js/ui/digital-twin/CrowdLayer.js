import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry, getZoneArcPath } from './StadiumGeometry.js';

export class CrowdLayer extends Component {
  render() {
    const { nodes, coords, selectedZoneId } = this.props;
    if (!nodes || nodes.length === 0) return h('g');

    const { innerRing, outerRing, zones } = StadiumGeometry;

    return h('g', { className: 'layer-crowd-zones' }, 
      nodes.map(node => {
        const zoneGeom = zones.find(z => z.id === node.id);
        if (!zoneGeom) return null;

        const density = node.metadata.occupancy || 0;
        
        // Define color gradient fills based on density threshold levels
        let fill = '#10b981'; // Green
        if (density > 80) fill = '#ef4444'; // Red
        else if (density > 50) fill = '#f59e0b'; // Orange

        const isSelected = selectedZoneId === node.id;

        const center = coords.worldToScreen(innerRing.cx, innerRing.cy);
        const pathData = getZoneArcPath(
          center.x, center.y,
          innerRing.rx * coords.scale, innerRing.ry * coords.scale,
          outerRing.rx * coords.scale, outerRing.ry * coords.scale,
          zoneGeom.startAngle, zoneGeom.endAngle
        );

        // Generate animated crowd particles flowing based on stand occupancy density
        const particles = [];
        const numRings = 3;
        const baseInnerRx = innerRing.rx;
        const baseInnerRy = innerRing.ry;
        const baseOuterRx = outerRing.rx;
        const baseOuterRy = outerRing.ry;

        const maxParticlesPerRing = 10;
        const numParticles = Math.max(3, Math.min(maxParticlesPerRing, Math.round((density / 100) * maxParticlesPerRing)));

        for (let i = 1; i <= numRings; i++) {
          const ringRatio = i / (numRings + 1);
          const rx = (baseInnerRx + (baseOuterRx - baseInnerRx) * ringRatio) * coords.scale;
          const ry = (baseInnerRy + (baseOuterRy - baseInnerRy) * ringRatio) * coords.scale;

          const startAngleRad = zoneGeom.startAngle * Math.PI / 180;
          const endAngleRad = zoneGeom.endAngle * Math.PI / 180;
          const angleSpan = endAngleRad - startAngleRad;

          for (let j = 1; j <= numParticles; j++) {
            const particleRatio = j / (numParticles + 1);
            const theta = startAngleRad + angleSpan * particleRatio;
            const px = center.x + rx * Math.cos(theta);
            const py = center.y + ry * Math.sin(theta);
            
            // Generate a deterministic unique delay for the particle
            const delay = ((i * j * 0.17) % 1.5).toFixed(2);

            particles.push(h('circle', {
              key: `part-${node.id}-${i}-${j}`,
              cx: px,
              cy: py,
              r: 1.8,
              fill: fill,
              className: 'crowd-particle',
              style: `animation: crowd-particle-flow 2s ease-in-out infinite alternate; animation-delay: -${delay}s; opacity: 0.8; pointer-events: none;`
            }));
          }
        }

        return h('g', { key: node.id, className: 'crowd-zone-container' }, [
          // Base Seating Stand Path (with low opacity as requested to keep stadium visual anchor)
          h('path', {
            d: pathData,
            fill: fill,
            stroke: isSelected ? '#ffffff' : '#1f2937',
            strokeWidth: isSelected ? '2.5' : '1.2',
            fillOpacity: isSelected ? '0.24' : '0.12',
            className: 'interactive-zone-segment',
            style: 'transition: fill-opacity 0.2s, stroke-width 0.2s; cursor: pointer;',
            'aria-label': `${node.id}: Density ${density}%`,
            tabindex: '0'
          }),
          // Flowing crowd particles list
          h('g', { className: 'zone-particles' }, particles)
        ]);
      })
    );
  }
}
export default CrowdLayer;
