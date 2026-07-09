import { BaseModel } from './base-model.js';
import { ResponderType } from './enums/ResponderType.js';

export class Responder extends BaseModel {
  constructor({ id, type, x, y, status }) {
    super('RESPONDER');
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.status = status || 'AVAILABLE'; // AVAILABLE, BUSY, OFFLINE
  }

  validate() {
    if (typeof this.id !== 'string' || !this.id.trim()) return false;
    if (!Object.values(ResponderType).includes(this.type)) return false;
    if (typeof this.x !== 'number' || isNaN(this.x)) return false;
    if (typeof this.y !== 'number' || isNaN(this.y)) return false;
    if (typeof this.status !== 'string' || !this.status.trim()) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Responder({
      id: raw.id,
      type: raw.type,
      x: raw.x,
      y: raw.y,
      status: raw.status
    });
  }
}
export default Responder;
