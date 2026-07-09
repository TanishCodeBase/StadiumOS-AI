import { BaseEngine } from '../base-engine.js';
import { DecisionTrace } from '../decision-trace.js';

export class ThreatAnalysisEngine extends BaseEngine {
  constructor() {
    super();
    this.id = 'threat-analysis';
    this.name = 'Operational Threat Evaluator';
    this.version = '1.0.0';
    this.description = 'Evaluates operational safety threats based on active incidents and crowd density';
    this.priority = 2; // Runs second
  }

  validate(frame) {
    return super.validate(frame) && Array.isArray(frame.incidents?.entities);
  }

  analyze(frame) {
    const startTime = performance.now();

    if (!this.validate(frame)) {
      return {
        engine: this.id,
        timestamp: frame.simulationTime,
        confidence: 0.0,
        severity: 'LOW',
        predictions: [],
        recommendations: [],
        reasoning: ['Validation failed: Missing active incidents logs.'],
        metrics: {}
      };
    }

    const incidents = frame.incidents.entities;
    const activeCount = frame.incidents.metrics?.activeCount || 0;
    const criticalCount = frame.incidents.metrics?.criticalCount || 0;

    // Determine severity threat index
    let severity = 'LOW';
    if (criticalCount > 0 || activeCount >= 3) {
      severity = 'HIGH';
    } else if (activeCount > 0) {
      severity = 'MEDIUM';
    }

    const confidenceScore = this.context.confidenceCalculator({
      dataQuality: 1.0,
      environmentalUncertainty: frame.weather?.entities?.condition === 'RAIN' ? 0.1 : 0.0,
      simulationStability: 1.0,
      historicalAccuracy: 0.96,
      predictionVariance: 0.0
    });

    const predictions = [];
    const recommendations = [];
    const reasoningSteps = [];

    if (activeCount > 0) {
      reasoningSteps.push(`NOC registers ${activeCount} active incident logs (${criticalCount} high priority).`);
      predictions.push({
        type: 'THREAT_ESCALATION',
        probability: criticalCount > 0 ? 0.8 : 0.4,
        reason: 'Active incidents require response coordination.'
      });

      const trace = new DecisionTrace({
        contributingFactors: [
          `Active Incident logs count is ${activeCount}`,
          `Critical Incident logs count is ${criticalCount}`
        ],
        reasoningSteps: [
          'Unresolved logs pose operational flow risks',
          'Severity indexed based on priority density limits'
        ],
        assumptions: ['Sensors are fully online', 'Responder response velocities are optimal'],
        confidence: confidenceScore,
        generatedBy: this.id,
        executionTime: performance.now() - startTime,
        timestamp: frame.simulationTime
      });

      recommendations.push({
        id: `REC-TA-${frame.tick}`,
        type: 'SECURITY_ALERT',
        action: criticalCount > 0 
          ? 'Emergency Alert: Dispatch tactical support to resolve high priority incidents immediately.' 
          : 'Monitor incidents: Coordinate local site guards to clear minor logs.',
        trace
      });
    } else {
      reasoningSteps.push('NOC registers zero active threat metrics. Safety boundary is secure.');
    }

    this._recordMetrics(startTime, confidenceScore);

    return {
      engine: this.id,
      timestamp: frame.simulationTime,
      confidence: confidenceScore,
      severity,
      predictions,
      recommendations,
      reasoning: reasoningSteps,
      metrics: this.getMetrics()
    };
  }

  getCapabilities() {
    return {
      canAnalyzeCrowd: false,
      canAnalyzeThreats: true,
      canRouteResponders: false
    };
  }
}
export default ThreatAnalysisEngine;
