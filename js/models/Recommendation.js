import { BaseModel } from './base-model.js';
import { RecommendationStatus } from './enums/RecommendationStatus.js';

export class Recommendation extends BaseModel {
  constructor({ id, type, action, trace, decisionId, parentDecision, generatedBy, timestamp, status }) {
    super('RECOMMENDATION');
    this.id = id;
    this.type = type;
    this.action = action;
    this.trace = Array.isArray(trace) ? trace : [];
    this.decisionId = decisionId;
    this.parentDecision = parentDecision || null;
    this.generatedBy = generatedBy;
    this.timestamp = typeof timestamp === 'number' ? timestamp : Date.now();
    this.status = status || RecommendationStatus.PENDING;
  }

  validate() {
    if (typeof this.id !== 'string' || !this.id.trim()) return false;
    if (typeof this.type !== 'string' || !this.type.trim()) return false;
    if (typeof this.action !== 'string' || !this.action.trim()) return false;
    if (!Array.isArray(this.trace)) return false;
    if (typeof this.decisionId !== 'string' || !this.decisionId.trim()) return false;
    if (this.parentDecision !== null && typeof this.parentDecision !== 'string') return false;
    if (typeof this.generatedBy !== 'string' || !this.generatedBy.trim()) return false;
    if (typeof this.timestamp !== 'number' || isNaN(this.timestamp)) return false;
    if (!Object.values(RecommendationStatus).includes(this.status)) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new Recommendation({
      id: raw.id,
      type: raw.type,
      action: raw.action,
      trace: raw.trace,
      decisionId: raw.decisionId,
      parentDecision: raw.parentDecision,
      generatedBy: raw.generatedBy,
      timestamp: raw.timestamp,
      status: raw.status
    });
  }
}
export default Recommendation;
