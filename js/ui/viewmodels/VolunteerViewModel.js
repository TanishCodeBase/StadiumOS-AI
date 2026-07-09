export class VolunteerViewModel {
  constructor(latestFrame) {
    this.sectors = [];
    const simVolunteers = latestFrame?.behaviors?.VolunteerSimulation?.entities || [];
    
    let sumActive = 0;
    let sumStandby = 0;
    
    this.sectors = simVolunteers.map(vol => {
      sumActive += vol.active || 0;
      sumStandby += vol.standby || 0;
      const busy = Math.floor((vol.active || 0) * 0.4);
      const total = (vol.active || 0) + (vol.standby || 0);
      const deployPercent = total > 0 ? Math.round((vol.active / total) * 100) : 0;

      return {
        sector: vol.sector,
        active: vol.active,
        standby: vol.standby,
        busy: busy,
        deploymentPercent: deployPercent,
        readinessStatus: deployPercent > 80 ? 'READY' : 'STANDBY'
      };
    });

    this.totalAvailable = sumActive + sumStandby;
    this.totalAssigned = sumActive;
    this.deploymentPercent = this.totalAvailable > 0 ? Math.round((this.totalAssigned / this.totalAvailable) * 100) : 0;
  }
}
export default VolunteerViewModel;
