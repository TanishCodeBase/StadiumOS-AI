export class EmergencyViewModel {
  constructor(latestFrame) {
    this.resources = [];
    const simResponders = latestFrame?.behaviors?.IncidentSimulation?.entities || [];
    
    const medCount = simResponders.filter(r => r.type === 'MEDICAL').length || 2;
    const policeCount = simResponders.filter(r => r.type === 'SECURITY').length || 4;
    const fireCount = simResponders.filter(r => r.type === 'FIRE').length || 1;

    this.resources = [
      { type: 'MEDICAL', count: medCount, status: 'NOMINAL' },
      { type: 'POLICE', count: policeCount, status: 'NOMINAL' },
      { type: 'FIRE', count: fireCount, status: 'NOMINAL' }
    ];

    this.totalAvailableUnits = medCount + policeCount + fireCount;
    this.nearestResponseZone = 'North Gate Checkpoint';
    this.estimatedDispatchTimeSec = 45;
  }
}
export default EmergencyViewModel;
