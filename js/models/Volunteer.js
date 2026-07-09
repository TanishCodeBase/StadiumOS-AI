import { BaseModel } from './base-model.js';

export class Volunteer extends BaseModel {
  constructor({ sector, active, standby }) {
    super('VOLUNTEER');
    this.sector = sector;
    this.active = active;
    this.standby = standby;
  }

  validate() {
    if (typeof this.sector !== 'string' || !this.sector.trim()) return false;
    if (typeof this.active !== 'number' || isNaN(this.active) || this.active < 0) return false;
    if (typeof this.standby !== 'number' || isNaN(this.standby) || this.standby < 0) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Volunteer({
      sector: raw.sector,
      active: raw.active,
      standby: raw.standby
    });
  }
}
export default Volunteer;
