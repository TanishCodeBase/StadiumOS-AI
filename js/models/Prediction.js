import { BaseModel } from './base-model.js';

export class Prediction extends BaseModel {
  constructor({ id, type, probability, generatedBy, timestamp }) {
    super('PREDICTION');
    this.id = id;
    this.type = type;
    this.probability = probability;
    this.generatedBy = generatedBy;
    this.timestamp = typeof timestamp === 'number' ? timestamp : Date.now();
  }

  validate() {
    if (typeof this.id !== 'string' || !this.id.trim()) return false;
    if (typeof this.type !== 'string' || !this.type.trim()) return false;
    if (typeof this.probability !== 'number' || isNaN(this.probability) || this.probability < 0 || this.probability > 1) return false;
    if (typeof this.generatedBy !== 'string' || !this.generatedBy.trim()) return false;
    if (typeof this.timestamp !== 'number' || isNaN(this.timestamp)) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Prediction({
      id: raw.id,
      type: raw.type,
      probability: raw.probability,
      generatedBy: raw.generatedBy,
      timestamp: raw.timestamp
    });
  }
}
export default Prediction;
