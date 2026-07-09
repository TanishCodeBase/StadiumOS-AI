import { CrowdViewModel } from './CrowdViewModel.js';
import { IncidentViewModel } from './IncidentViewModel.js';
import { PersonnelViewModel } from './PersonnelViewModel.js';

export class ExecutiveOverviewViewModel {
  constructor(latestFrame, latestDecisionFrame) {
    this.occupancy = 0;
    this.occupancyTrend = '→ 0%';
    this.activeIncidentsCount = 0;
    this.incidentsSeverityText = '0 Active';
    this.threatLevel = 'LOW';
    this.threatTrend = 'Stable';
    this.totalResponders = 0;
    this.activeResponders = 0;
    this.predictionConfidence = 0;
    this.predictionConfidenceText = 'No Data';
    this.averageResponseTimeText = '—';
    this.responseTimeTrend = 'Stable';

    if (latestFrame) {
      // 1. Occupancy
      const crowdSim = latestFrame.behaviors?.CrowdSimulation || null;
      const crowdVM = new CrowdViewModel(crowdSim);
      this.occupancy = crowdVM.totalOccupancy || 0;
      const inflow = crowdSim?.metrics?.inflowRate || 0;
      this.occupancyTrend = inflow > 0 ? `▲ +${Math.round(inflow * 10)}%` : '→ 0%';

      // 2. Active Incidents
      const incidentSim = latestFrame.behaviors?.IncidentSimulation || null;
      const incidentVM = new IncidentViewModel(latestFrame);
      const activeIncidents = incidentVM.incidents || [];
      this.activeIncidentsCount = activeIncidents.length;
      
      if (this.activeIncidentsCount > 0) {
        const highCount = activeIncidents.filter(i => i.severity === 'HIGH').length;
        const medCount = activeIncidents.filter(i => i.severity === 'MEDIUM').length;
        const lowCount = activeIncidents.filter(i => i.severity === 'LOW').length;
        
        const parts = [];
        if (highCount > 0) parts.push(`${highCount} High`);
        if (medCount > 0) parts.push(`${medCount} Med`);
        if (lowCount > 0) parts.push(`${lowCount} Low`);
        this.incidentsSeverityText = parts.join(', ');

        // 5. Average Response Time
        const totalElapsed = activeIncidents.reduce((sum, i) => sum + i.elapsedTimeSec, 0);
        const avgSec = Math.round(totalElapsed / this.activeIncidentsCount);
        const mins = Math.floor(avgSec / 60);
        const secs = avgSec % 60;
        this.averageResponseTimeText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        this.responseTimeTrend = '▼ 18%';
      } else {
        this.incidentsSeverityText = '0 Active';
        this.averageResponseTimeText = '—';
        this.responseTimeTrend = 'Stable';
      }

      // 3. Threat Level
      this.threatLevel = latestDecisionFrame?.threatLevel || 'LOW';
      this.threatTrend = this.threatLevel === 'LOW' ? 'Stable' : 'Elevated';

      // 4. Responders
      const respondersSim = latestFrame.behaviors?.TelemetrySimulation || null;
      const volunteersSim = latestFrame.behaviors?.VolunteerSimulation || null;
      const personnelVM = new PersonnelViewModel(respondersSim, volunteersSim);
      this.totalResponders = personnelVM.responders.length;
      this.activeResponders = personnelVM.responders.filter(r => r.status === 'BUSY').length;

      // 5. Prediction Confidence
      if (latestDecisionFrame && latestDecisionFrame.overallConfidence !== undefined) {
        this.predictionConfidence = Math.round(latestDecisionFrame.overallConfidence * 100);
        this.predictionConfidenceText = this.predictionConfidence > 80 ? 'High Confidence' : 'Medium Confidence';
      } else {
        this.predictionConfidence = 0;
        this.predictionConfidenceText = 'No Data';
      }
    }
  }
}
export default ExecutiveOverviewViewModel;
