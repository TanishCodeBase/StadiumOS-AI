import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class HeatmapLayer extends Component {
  render() {
    const { viewModel, coords } = this.props;
    if (!viewModel || !viewModel.points) return h('g');

    const settings = StadiumGeometry.VisualSettings?.heatmap || { opacity: '0.30', blur: '10px' };

    return h('g', { className: 'layer-heatmap-overlay' }, 
      viewModel.points.map((pt, idx) => {
        // Transform center coordinates
        const screenPt = coords.worldToScreen(pt.x, pt.y);
        const radius = pt.radius * coords.scale;
        
        // Calculate heat intensity color
        const fill = viewModel.getHeatColor(pt.value);

        return h('circle', {
          cx: screenPt.x,
          cy: screenPt.y,
          r: radius,
          fill: fill,
          fillOpacity: settings.opacity,
          style: `pointer-events: none; filter: blur(${settings.blur}); mix-blend-mode: screen; transition: r 0.2s, fill 0.2s;`
        });
      })
    );
  }
}
export default HeatmapLayer;
