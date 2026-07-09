/**
 * StadiumOS AI - Decision Trace
 * Explainability model providing structured traceability for AI recommendations
 */
export class DecisionTrace {
  constructor({
    contributingFactors = [],
    reasoningSteps = [],
    assumptions = [],
    confidence = 1.0,
    generatedBy = '',
    executionTime = 0,
    timestamp = 0
  }) {
    this.contributingFactors = Array.isArray(contributingFactors) ? contributingFactors : [contributingFactors];
    this.reasoningSteps = Array.isArray(reasoningSteps) ? reasoningSteps : [reasoningSteps];
    this.assumptions = Array.isArray(assumptions) ? assumptions : [assumptions];
    this.confidence = typeof confidence === 'number' ? confidence : 1.0;
    this.generatedBy = generatedBy || 'system';
    this.executionTime = typeof executionTime === 'number' ? executionTime : 0;
    this.timestamp = typeof timestamp === 'number' ? timestamp : 0;

    // Freeze sub-arrays to enforce explainability records are immutable
    Object.freeze(this.contributingFactors);
    Object.freeze(this.reasoningSteps);
    Object.freeze(this.assumptions);
    Object.freeze(this);
  }
}
export default DecisionTrace;
