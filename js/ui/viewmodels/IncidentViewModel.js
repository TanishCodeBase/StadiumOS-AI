export class IncidentViewModel {
  constructor(latestFrame) {
    this.incidents = [];
    
    const simIncidents = latestFrame?.behaviors?.IncidentSimulation?.entities || [];
    this.incidents = simIncidents.map(inc => ({
      id: inc.id,
      type: inc.type,
      location: inc.location,
      severity: inc.severity,
      status: inc.status,
      assignedResponders: inc.type === 'MEDICAL' ? ['MED-1', 'STAFF-A'] : ['SEC-3', 'FIRE-1'],
      elapsedTimeSec: Math.max(0, Math.floor((Date.now() - (inc.timestamp || Date.now())) / 1000))
    }));
  }
}
export default IncidentViewModel;
