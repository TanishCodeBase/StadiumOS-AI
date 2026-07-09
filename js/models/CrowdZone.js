import { BaseModel } from './base-model.js';
import { ZoneStatus } from './enums/ZoneStatus.js';

export class CrowdZone extends BaseModel {
  constructor({ zone, occupancy, capacity, status }) {
    super('CROWD_ZONE');
    this.zone = zone;
    this.occupancy = occupancy;
    this.capacity = capacity;
    this.status = status || ZoneStatus.NORMAL;
  }

  validate() {
    if (typeof this.zone !== 'string' || !this.zone.trim()) return false;
    if (typeof this.occupancy !== 'number' || isNaN(this.occupancy) || this.occupancy < 0) return false;
    if (typeof this.capacity !== 'number' || isNaN(this.capacity) || this.capacity < 0) return false;
    if (!Object.values(ZoneStatus).includes(this.status)) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new CrowdZone({
      zone: raw.zone,
      occupancy: raw.occupancy,
      capacity: raw.capacity,
      status: raw.status
    });
  }
}
export default CrowdZone;
