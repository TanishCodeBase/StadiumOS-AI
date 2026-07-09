import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { SeverityBadge } from '../components/visualizations/SeverityBadge.js';
import { StatusChip } from '../components/visualizations/StatusChip.js';
import { EmptyState } from '../components/visualizations/EmptyState.js';

export class IncidentPanel extends BasePanel {
  render() {
    const { viewModel } = this.props;

    if (!viewModel || viewModel.incidents.length === 0) {
      return this.renderCard('Incidents Log', 'NOMINAL', 
        h(EmptyState, { message: 'All parameters nominal. Zero active incidents.', icon: '🛡️' })
      );
    }

    return this.renderCard('Incidents Log', `${viewModel.incidents.length} ACTIVE`, 
      h('div', { className: 'incidents-list', style: 'display: flex; flex-direction: column; gap: 6px; padding: 0 10px;' }, 
        viewModel.incidents.map(inc => {
          let borderColor = '#ec4899'; // Medical / Staff
          if (inc.severity === 'HIGH') borderColor = '#ef4444'; // Red
          else if (inc.severity === 'MEDIUM') borderColor = '#f59e0b'; // Orange
          else if (inc.severity === 'LOW') borderColor = '#3b82f6'; // Blue

          return h('div', { 
            key: inc.id,
            className: 'incident-card-compact',
            style: `border-left: 3px solid ${borderColor}; background: rgba(255,255,255,0.015); padding: 8px 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 4px; transition: background 0.2s;` 
          }, [
            // Top Row: Type & Severity Badge
            h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' }, [
              h('span', { style: 'font-weight: bold; font-size: 11px; color: #ffffff;' }, inc.type),
              h('div', { style: 'display: flex; gap: 4px; align-items: center;' }, [
                h(SeverityBadge, { severity: inc.severity }),
                h(StatusChip, { status: inc.status })
              ])
            ]),
            
            // Bottom Row: Location and Elapsed Time
            h('div', { 
              style: 'font-size: 9.5px; font-family: var(--font-mono); color: #9ca3af; display: flex; justify-content: space-between; align-items: center;' 
            }, [
              h('span', null, `LOC: ${inc.location.toUpperCase()}`),
              h('span', { style: 'color: #d1d5db;' }, `ELAPSED: ${inc.elapsedTimeSec}s`)
            ])
          ]);
        })
      )
    );
  }
}

export default IncidentPanel;
