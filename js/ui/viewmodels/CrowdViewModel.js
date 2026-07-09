import { CrowdZone } from '../../models/CrowdZone.js';

export class CrowdViewModel {
  constructor(crowdData) {
    this.zones = [];
    this.totalOccupancy = 0;
    this.inflowRate = 0;

    if (crowdData) {
      this.inflowRate = crowdData.metrics?.inflowRate || 0;
      
      const entities = crowdData.entities || [];
      this.zones = entities.map(e => CrowdZone.from(e)).filter(Boolean);
      
      const totalCap = this.zones.reduce((sum, z) => sum + z.capacity, 0);
      const totalOcc = this.zones.reduce((sum, z) => sum + (z.occupancy * z.capacity / 100), 0);
      this.totalOccupancy = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;
    }
  }

  getZoneDensity(zoneName) {
    const zone = this.zones.find(z => z.zone === zoneName);
    return zone ? zone.occupancy : 0;
  }

  getZoneColor(zoneName) {
    const density = this.getZoneDensity(zoneName);
    if (density > 80) return '#ef4444'; // critical red
    if (density > 50) return '#f59e0b'; // warning orange
    return '#10b981'; // normal green
  }
}
export default CrowdViewModel;
