export class TimelineViewModel {
  // Static array to persist history across instantiation sweeps
  static history = [];

  constructor(latestFrame, latestDecisionFrame) {
    const currentEvents = [];

    if (latestFrame) {
      currentEvents.push({
        id: `sim-tick-${latestFrame.tick}`,
        type: 'SIMULATION',
        category: 'SYSTEM',
        icon: '⏳',
        severity: 'LOW',
        message: `Simulation Frame tick processed at timestamp ${latestFrame.timestamp}.`,
        trendValues: [12, 15, 18, 14, 20, 25, 22],
        timestamp: Date.now()
      });

      const incidents = latestFrame.behaviors?.IncidentSimulation?.entities || [];
      incidents.forEach(inc => {
        currentEvents.push({
          id: `inc-${inc.id}-${inc.status}`,
          type: 'INCIDENT',
          category: 'SAFETY',
          icon: inc.status === 'Resolved' ? '✅' : '🚨',
          severity: inc.severity || 'HIGH',
          message: `Incident ${inc.status}: ${inc.type} at ${inc.location} (Severity: ${inc.severity}).`,
          timestamp: inc.timestamp || Date.now()
        });
      });

      const transitRoutes = latestFrame.behaviors?.TransitSimulation?.entities || [];
      transitRoutes.forEach(r => {
        if (r.status === 'DELAYED') {
          currentEvents.push({
            id: `transit-${r.line}-${latestFrame.tick}`,
            type: 'TRANSPORT',
            category: 'TRANSIT',
            icon: '🚌',
            severity: 'MEDIUM',
            message: `Metro line delay flagged: ${r.line} experiencing delays.`,
            timestamp: Date.now()
          });
        }
      });
    }

    if (latestDecisionFrame) {
      currentEvents.push({
        id: `decision-tick-${latestDecisionFrame.simulationTick}`,
        type: 'DECISION',
        category: 'AI',
        icon: '🤖',
        severity: 'MEDIUM',
        message: `AI Pipeline compiled Decision Frame: Overall Confidence ${Math.round(latestDecisionFrame.overallConfidence * 100)}%.`,
        timestamp: latestDecisionFrame.timestamp
      });

      const recs = latestDecisionFrame.recommendations || [];
      recs.forEach(rec => {
        currentEvents.push({
          id: `rec-${rec.id}-${rec.status}`,
          type: 'RECOMMENDATION',
          category: 'ROUTING',
          icon: '🗺️',
          severity: 'MEDIUM',
          message: `Recommendation ${rec.status}: ${rec.action}.`,
          timestamp: rec.timestamp
        });
      });
    }

    // Merge new events into static history, avoiding duplicates
    currentEvents.forEach(evt => {
      const exists = TimelineViewModel.history.some(h => h.id === evt.id);
      if (!exists) {
        TimelineViewModel.history.unshift(evt); // add to top
      }
    });

    // Prune history to limit maximum size to 25 items
    if (TimelineViewModel.history.length > 25) {
      TimelineViewModel.history = TimelineViewModel.history.slice(0, 25);
    }

    this.events = [...TimelineViewModel.history];
  }
}
export default TimelineViewModel;
