import { h } from '../../../core/vdom.js';
import { Component } from '../../../core/component.js';
import { ProgressRing } from './ProgressRing.js';

export class ConfidenceRing extends Component {
  render() {
    const { value = 0, size = 32 } = this.props;

    // Convert decimal confidence (0.95) to percentage (95) if needed
    const percentVal = value <= 1.0 ? value * 100 : value;

    let color = '#ef4444'; // Low confidence (< 50%)
    if (percentVal >= 90) color = '#10b981'; // Green
    else if (percentVal >= 70) color = '#3b82f6'; // Blue
    else if (percentVal >= 50) color = '#f59e0b'; // Orange

    return h(ProgressRing, {
      value: percentVal,
      min: 0,
      max: 100,
      size: size,
      strokeWidth: 3,
      color: color
    });
  }
}
export default ConfidenceRing;
