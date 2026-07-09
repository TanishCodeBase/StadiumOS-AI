import { BaseModel } from './base-model.js';
import { IncidentType } from './enums/IncidentType.js';
import { IncidentSeverity } from './enums/IncidentSeverity.js';

export class Incident extends BaseModel {
  constructor({ id, type, location, severity, status, timestamp }) {
    super('INCIDENT');
    this.id = id;
    this.type = type;
    this.location = location;
    this.severity = severity;
    this.status = status || 'ACTIVE'; // ACTIVE, RESOLVED
    this.timestamp = typeof timestamp === 'number' ? timestamp : Date.now();
  }

  validate() {
    if (typeof this.id !== 'string' || !this.id.trim()) return false;
    if (!Object.values(IncidentType).includes(this.type)) return false;
    if (typeof this.location !== 'string' || !this.location.trim()) return false;
    if (!Object.values(IncidentSeverity).includes(this.severity)) return false;
    if (typeof this.status !== 'string' || !this.status.trim()) return false;
    if (typeof this.timestamp !== 'number' || isNaN(this.timestamp)) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Incident({
      id: raw.id,
      type: raw.type,
      location: raw.location,
      severity: raw.severity,
      status: raw.status,
      timestamp: raw.timestamp
    });
  }
}
export default Incident;
