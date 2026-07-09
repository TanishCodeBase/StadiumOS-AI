import { BaseModel } from './base-model.js';
import { RouteStatus } from './enums/RouteStatus.js';

export class TransitRoute extends BaseModel {
  constructor({ line, etaMin, loadFactor, status }) {
    super('TRANSIT_ROUTE');
    this.line = line;
    this.etaMin = etaMin;
    this.loadFactor = loadFactor;
    this.status = status || RouteStatus.ON_TIME;
  }

  validate() {
    if (typeof this.line !== 'string' || !this.line.trim()) return false;
    if (typeof this.etaMin !== 'number' || isNaN(this.etaMin) || this.etaMin < 0) return false;
    if (typeof this.loadFactor !== 'number' || isNaN(this.loadFactor) || this.loadFactor < 0) return false;
    if (!Object.values(RouteStatus).includes(this.status)) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new TransitRoute({
      line: raw.line,
      etaMin: raw.etaMin,
      loadFactor: raw.loadFactor,
      status: raw.status
    });
  }
}
export default TransitRoute;
