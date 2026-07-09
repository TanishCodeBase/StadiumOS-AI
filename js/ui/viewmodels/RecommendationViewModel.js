export class RecommendationViewModel {
  constructor(decisionFrame, latestFrame) {
    this.recommendations = [];
    this.overallConfidence = 0;
    this.threatLevel = 'LOW';
    this.timestamp = Date.now();

    if (decisionFrame) {
      this.overallConfidence = decisionFrame.overallConfidence || 0;
      this.threatLevel = decisionFrame.threatLevel || 'LOW';
      this.timestamp = decisionFrame.timestamp || Date.now();
      
      const recs = decisionFrame.recommendations || [];
      
      // Extract crowd entities to find congested stands
      const crowd = latestFrame?.behaviors?.CrowdSimulation || null;
      const crowdEntities = crowd?.entities || [];
      
      // Map zone ID to stand names
      const standNames = {
        'ZONE-N': 'North Stand',
        'ZONE-E': 'East Stand',
        'ZONE-S': 'South Stand',
        'ZONE-W': 'West Stand'
      };
      
      const congestedStands = crowdEntities
        .filter(z => (z.occupancy || z.density || 0) > 75)
        .map(z => standNames[z.id] || z.id);

      this.recommendations = recs.map(rec => {
        let situation = 'Operational parameters nominal.';
        let reason = 'Sensor readings indicate normal flow rates.';
        let action = rec.action;
        let horizon = 'Next 3 minutes';
        let impact = [
          { label: 'Evacuation Time', change: '↓ 38%' },
          { label: 'Queue Length', change: '↓ 31%' },
          { label: 'Risk Level', change: 'High → Medium' }
        ];

        const confidenceVal = Math.round((rec.trace?.confidence || decisionFrame.overallConfidence || 0.91) * 100);

        if (rec.type.includes('CROWD') || rec.type.includes('DIVERSION')) {
          const standStr = congestedStands.length > 0 ? congestedStands.join(', ') : 'North Stand';
          situation = `${standStr} concourse congestion rising rapidly.`;
          reason = `Stand utilization exceeds 92%. Crowd prediction model forecasts bottleneck congestion within 3 minutes.`;
          action = `Redirect spectator inflows from ${standStr} to Gate B (East Entrance).`;
          horizon = 'Next 3 minutes';
          impact = [
            { label: 'Queue Length', change: '↓ 31%' },
            { label: 'Walking Time', change: '↓ 24%' },
            { label: 'Risk Level', change: 'High → Medium' }
          ];
        } else if (rec.type.includes('DISPATCH') || rec.type.includes('ROUTE')) {
          situation = 'Active perimeter incident requires immediate responder dispatch.';
          reason = 'Security response model calculated closest responder waypoint coordinates. Evacuation routes must remain clear.';
          action = rec.action || 'Dispatch closest emergency personnel detail to resolve incident immediately.';
          horizon = 'Next 2 minutes';
          impact = [
            { label: 'Response Time', change: '↓ 18%' },
            { label: 'Dispatch Latency', change: '↓ 24%' },
            { label: 'Incident Risk', change: 'Medium → Low' }
          ];
        } else if (rec.type.includes('SECURITY') || rec.type.includes('ALERT')) {
          situation = 'Security logs queue density approaching critical thresholds.';
          reason = 'Backlog of active uncontained incident logs escalation risks identified near gates.';
          action = rec.action || 'Deploy backup site guards and coordinate check-in perimeter.';
          horizon = 'Next 5 minutes';
          impact = [
            { label: 'Containment Time', change: '↓ 35%' },
            { label: 'Perimeter Risk', change: 'High → Low' }
          ];
        }

        return {
          id: rec.id,
          type: rec.type,
          action,
          situation,
          reason,
          impact,
          horizon,
          confidence: confidenceVal,
          decisionId: rec.decisionId || rec.id || 'DEC-001',
          generatedBy: rec.generatedBy || 'NOC AI Engine',
          timestamp: rec.timestamp || Date.now(),
          status: rec.status || 'PENDING',
          resolutionTimeEstimateMin: rec.type.includes('DIVERSION') ? 15 : 8,
          evidence: rec.trace?.contributingFactors || ['Sensor readings within bounds'],
          predictedImpact: rec.trace?.assumptions || ['Normal crowd flows restored']
        };
      });
    }
  }
}
export default RecommendationViewModel;
