import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';

export class LoadingSkeleton extends Component {
  render() {
    const { rows = 3, height = 12 } = this.props;

    const dummyArray = Array.from({ length: rows });

    return h('div', { 
      className: 'viz-loading-skeleton',
      style: 'display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 4px;'
    }, 
      dummyArray.map((_, idx) => {
        const widths = ['85%', '95%', '70%', '80%'];
        const width = widths[idx % widths.length];

        return h('div', { 
          className: 'skeleton-bar',
          style: `width: ${width}; height: ${height}px; background: #1f2937; border-radius: 4px; opacity: 0.5;`
        });
      })
    );
  }
}
export default LoadingSkeleton;
