import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { DigitalTwin } from '../digital-twin/DigitalTwin.js';

class BasePanel extends Component {
  renderCard(title, badge, children) {
    const { gridClass, style } = this.props;
    return h('div', { 
      className: `dashboard-card ${gridClass || ''}`,
      style: style || ''
    }, [
      h('div', { className: 'card-header' }, [
        h('div', { className: 'card-header-main' }, [
          h('span', { className: 'card-status-dot' }),
          h('h3', { className: 'card-title' }, title)
        ]),
        h('div', { className: 'card-header-actions' }, [
          h('span', { className: 'card-badge' }, badge)
        ])
      ]),
      h('div', { className: 'card-body-scroll', style: 'padding: 0; overflow: hidden; height: 100%; width: 100%; display: flex; flex-direction: column;' }, children)
    ]);
  }
}

export class DigitalTwinPanel extends BasePanel {
  render() {
    const { latestDecisionFrame } = this.props;
    const threatLevel = latestDecisionFrame?.threatLevel || 'LOW';
    
    return this.renderCard('Digital Twin', `THREAT: ${threatLevel}`, [
      h(DigitalTwin)
    ]);
  }
}

export class AiRecommendationsPanel extends BasePanel {
  render() {
    const { latestDecisionFrame } = this.props;
    
    if (!latestDecisionFrame || latestDecisionFrame.recommendations.length === 0) {
      return this.renderCard('AI Recommendations', 'CLEAR', h('div', { className: 'placeholder-text' }, 'Decision Pipeline Standing By. All parameters nominal.'));
    }

    const { recommendations, overallConfidence } = latestDecisionFrame;

    return this.renderCard('AI Recommendations', `CONF: ${Math.round(overallConfidence * 100)}%`, [
      h('div', { className: 'recommendations-container' }, 
        recommendations.map(rec => {
          const trace = rec.trace;
          return h('div', { className: 'recommendation-box' }, [
            h('div', { className: 'rec-header' }, [
              h('span', { className: 'rec-title' }, `⚠️ ${rec.type}`),
              h('span', { className: 'rec-engine' }, trace.generatedBy)
            ]),
            h('p', { className: 'rec-desc' }, rec.action),
            
            // Explainable Trace details
            h('div', { className: 'trace-details' }, [
              h('h5', { className: 'trace-section-title' }, 'DECISION TRACE / REASONING CHAIN'),
              h('div', { className: 'trace-block' }, [
                h('span', { className: 'trace-lbl' }, 'CONTRIBUTING FACTORS:'),
                h('ul', { className: 'trace-list' }, trace.contributingFactors.map(f => h('li', null, f)))
              ]),
              h('div', { className: 'trace-block' }, [
                h('span', { className: 'trace-lbl' }, 'LOGICAL STEPS:'),
                h('ol', { className: 'trace-list decimal' }, trace.reasoningSteps.map(s => h('li', null, s)))
              ]),
              h('div', { className: 'trace-block' }, [
                h('span', { className: 'trace-lbl' }, 'ASSUMPTIONS:'),
                h('ul', { className: 'trace-list' }, trace.assumptions.map(a => h('li', null, a)))
              ]),
              h('div', { className: 'trace-footer' }, [
                h('span', null, `Confidence: ${Math.round(trace.confidence * 100)}%`),
                h('span', null, `Latency: ${trace.executionTime.toFixed(2)}ms`)
              ])
            ])
          ]);
        })
      )
    ]);
  }
}

export class IncidentsPanel extends BasePanel {
  render() {
    const { latestFrame } = this.props;
    const incidents = latestFrame?.behaviors?.IncidentSimulation?.entities || [];

    if (!latestFrame || incidents.length === 0) {
      return this.renderCard('Incidents', '0 ACTIVE', h('div', { className: 'placeholder-text' }, 'No Active Incidents. All Systems Clear.'));
    }

    return this.renderCard('Incidents', `${incidents.length} ACTIVE`, h('div', { className: 'incident-list' }, 
      incidents.map(inc => h('div', { className: `incident-row ${inc.severity.toLowerCase()}` }, [
        h('div', { className: 'incident-head' }, [
          h('span', { className: 'incident-id' }, inc.id),
          h('span', { className: 'incident-type' }, inc.type)
        ]),
        h('div', { className: 'incident-foot' }, [
          h('span', { className: 'incident-loc' }, inc.location),
          h('span', { className: 'incident-sev' }, inc.severity)
        ])
      ]))
    ));
  }
}

export class TransportPanel extends BasePanel {
  render() {
    const { latestFrame } = this.props;
    const transit = latestFrame?.behaviors?.TransitSimulation;

    if (!latestFrame || !transit) {
      return this.renderCard('Transport', 'STANDBY', h('div', { className: 'placeholder-text' }, 'Awaiting Transit Feeds...'));
    }

    return this.renderCard('Transport', 'ACTIVE', [
      h('div', { className: 'metrics-strip' }, [
        h('div', { className: 'metric-item' }, [
          h('span', { className: 'lbl' }, 'AVERAGE LOAD'),
          h('span', { className: 'val' }, `${transit.metrics.averageLoad}%`)
        ]),
        h('div', { className: 'metric-item' }, [
          h('span', { className: 'lbl' }, 'ACTIVE VEHICLES'),
          h('span', { className: 'val' }, String(transit.metrics.activeVehicles))
        ])
      ]),
      h('table', { className: 'transit-table' }, [
        h('thead', null, [
          h('tr', null, [
            h('th', null, 'LINE'),
            h('th', null, 'ETA'),
            h('th', null, 'LOAD'),
            h('th', null, 'STATUS')
          ])
        ]),
        h('tbody', null, 
          transit.entities.map(line => h('tr', null, [
            h('td', null, line.line),
            h('td', null, `${line.etaMin}m`),
            h('td', null, `${line.loadFactor}%`),
            h('td', { className: line.status.toLowerCase() }, line.status)
          ]))
        )
      ])
    ]);
  }
}

export class TimelinePanel extends BasePanel {
  render() {
    const { latestFrame } = this.props;
    const crowdEvents = latestFrame?.behaviors?.CrowdSimulation?.events || [];
    const incidentEvents = latestFrame?.behaviors?.IncidentSimulation?.events || [];
    const allEvents = [...crowdEvents, ...incidentEvents];

    if (!latestFrame || allEvents.length === 0) {
      return this.renderCard('Operations Timeline', 'CLEAR', h('div', { className: 'placeholder-text' }, 'Timeline stand-by. Simulation ticks logged here.'));
    }

    return this.renderCard('Operations Timeline', 'LIVE', h('div', { className: 'timeline-log' }, 
      allEvents.map(evt => h('div', { className: 'timeline-item' }, [
        h('span', { className: 'time-tag' }, `T+${Math.round(latestFrame.timestamp)}s`),
        h('span', { className: 'time-msg' }, evt.message)
      ]))
    ));
  }
}

export class HealthPanel extends BasePanel {
  render() {
    const { latestFrame, latestDecisionFrame } = this.props;

    if (!latestFrame) {
      return this.renderCard('Health', 'STANDBY', h('div', { className: 'placeholder-text' }, 'Awaiting Diagnostics...'));
    }

    const aiLatency = latestDecisionFrame?.metrics?.executionTimeMs || 0;
    const aiAvgLatency = latestDecisionFrame?.metrics?.averagePipelineDurationMs || 0;

    return this.renderCard('Health', 'OPTIMAL', [
      h('div', { className: 'health-stats' }, [
        h('div', { className: 'stat-row' }, [
          h('span', { className: 'lbl' }, 'SCHEDULER ENGINE'),
          h('span', { className: 'val ok' }, 'STABLE')
        ]),
        h('div', { className: 'stat-row' }, [
          h('span', { className: 'lbl' }, 'TICK COMPUTE TIME'),
          h('span', { className: 'val' }, `${latestFrame.metrics.executionTimeMs.toFixed(2)}ms`)
        ]),
        h('div', { className: 'stat-row' }, [
          h('span', { className: 'lbl' }, 'AI PIPELINE LATENCY'),
          h('span', { className: 'val ok' }, `${aiLatency.toFixed(2)}ms (Avg: ${aiAvgLatency.toFixed(2)}ms)`)
        ]),
        h('div', { className: 'stat-row' }, [
          h('span', { className: 'lbl' }, 'COMPUTED BY'),
          h('span', { className: 'val highlight' }, latestFrame.processedBy || 'InProcess')
        ])
      ])
    ]);
  }
}

export class EmergencyPanel extends BasePanel {
  render() {
    const { latestFrame } = this.props;
    const telemetry = latestFrame?.behaviors?.TelemetrySimulation;

    if (!latestFrame || !telemetry) {
      return this.renderCard('Emergency', 'STANDBY', h('div', { className: 'placeholder-text' }, 'Awaiting Responder Coordinates...'));
    }

    return this.renderCard('Emergency', 'ACTIVE', h('div', { className: 'emergency-list' }, 
      telemetry.entities.map(u => h('div', { className: 'emergency-row' }, [
        h('span', { className: 'unit-id' }, u.id),
        h('span', { className: `unit-type ${u.type.toLowerCase()}` }, u.type),
        h('span', { className: 'unit-coords' }, `(${u.x}, ${u.y})`)
      ]))
    ));
  }
}

export class VolunteersPanel extends BasePanel {
  render() {
    const { latestFrame } = this.props;
    const volunteers = latestFrame?.behaviors?.VolunteerSimulation;

    if (!latestFrame || !volunteers) {
      return this.renderCard('Volunteers', 'STANDBY', h('div', { className: 'placeholder-text' }, 'Awaiting Staff Allocation...'));
    }

    return this.renderCard('Volunteers', `${volunteers.metrics.totalStaffed} DEPLOYED`, [
      h('div', { className: 'metrics-strip' }, [
        h('div', { className: 'metric-item' }, [
          h('span', { className: 'lbl' }, 'ACTIVE STAFFING RATIO'),
          h('span', { className: 'val' }, `${Math.round(volunteers.metrics.activeRatio * 100)}%`)
        ])
      ]),
      h('div', { className: 'volunteer-grid' }, 
        volunteers.entities.map(v => h('div', { className: 'vol-sector-card' }, [
          h('span', { className: 'sector-name' }, v.sector),
          h('div', { className: 'sector-numbers' }, [
            h('span', { className: 'active' }, `ACTIVE: ${v.active}`),
            h('span', { className: 'standby' }, `STBY: ${v.standby}`)
          ])
        ]))
      )
    ]);
  }
}
