import { BaseModel } from './base-model.js';
import { RecommendationStatus } from './enums/RecommendationStatus.js';

export class Decision extends BaseModel {
  constructor({ id, parentDecision, generatedBy, timestamp, status, conclusion }) {
    super('DECISION');
    this.id = id;
    this.parentDecision = parentDecision || null;
    this.generatedBy = generatedBy;
    this.timestamp = typeof timestamp === 'number' ? timestamp : Date.now();
    this.status = status || RecommendationStatus.PENDING;
    this.conclusion = conclusion;
  }

  validate() {
    if (typeof this.id !== 'string' || !this.id.trim()) return false;
    if (this.parentDecision !== null && typeof this.parentDecision !== 'string') return false;
    if (typeof this.generatedBy !== 'string' || !this.generatedBy.trim()) return false;
    if (typeof this.timestamp !== 'number' || isNaN(this.timestamp)) return false;
    if (!Object.values(RecommendationStatus).includes(this.status)) return false;
    if (typeof this.conclusion !== 'string' || !this.conclusion.trim()) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Decision({
      id: raw.id,
      parentDecision: raw.parentDecision,
      generatedBy: raw.generatedBy,
      timestamp: raw.timestamp,
      status: raw.status,
      conclusion: raw.conclusion
    });
  }
}
export default Decision;
