import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { EmptyState } from '../components/visualizations/EmptyState.js';

export class OperationsTimeline extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || !viewModel.events || viewModel.events.length === 0) {
      return this.renderCard('Operations Timeline', 'STANDBY', 
        h(EmptyState, { message: 'Awaiting log feed ticks...', icon: '📭' })
      );
    }

    return this.renderCard('Operations Timeline', 'LIVE FEED', 
      h('div', { 
        className: 'timeline-feed',
        style: 'display: flex; flex-direction: column; gap: 6px; padding: 10px 14px; position: relative;' 
      }, 
        viewModel.events.map((ev, idx) => {
          const date = new Date(ev.timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          
          let dotColor = '#3b82f6'; // Blue
          if (ev.severity === 'HIGH') dotColor = '#ef4444'; // Red
          else if (ev.severity === 'MEDIUM') dotColor = '#f59e0b'; // Orange
          else if (ev.category?.includes('AI')) dotColor = '#a855f7'; // Purple (AI)

          return h('div', { 
            key: ev.id || idx,
            className: 'timeline-item-condensed',
            style: 'display: flex; align-items: flex-start; gap: 8px; font-size: 10.5px; position: relative; padding-bottom: 6px;' 
          }, [
            // Time Column
            h('span', { 
              style: 'font-family: var(--font-mono); color: #9ca3af; width: 52px; flex-shrink: 0; text-align: right;' 
            }, timeStr),

            // Vertical timeline line dot
            h('div', { 
              style: 'display: flex; flex-direction: column; align-items: center; width: 10px; flex-shrink: 0; margin-top: 3px;' 
            }, [
              h('div', { 
                style: `width: 6px; height: 6px; border-radius: 50%; background: ${dotColor}; box-shadow: 0 0 4px ${dotColor};` 
              })
            ]),

            // Message Column
            h('div', { style: 'flex: 1; display: flex; flex-direction: column; gap: 1px;' }, [
              h('span', { style: 'font-weight: 500; color: #ffffff;' }, ev.message),
              ev.category ? h('span', { style: 'font-size: 8px; font-family: var(--font-mono); color: #6b7280; text-transform: uppercase;' }, ev.category) : null
            ])
          ]);
        })
      )
    );
  }
}

export default OperationsTimeline;
