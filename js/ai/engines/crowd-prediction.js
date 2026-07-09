import { BaseEngine } from '../base-engine.js';
import { DecisionTrace } from '../decision-trace.js';

export class CrowdPredictionEngine extends BaseEngine {
  constructor() {
    super();
    this.id = 'crowd-prediction';
    this.name = 'Crowd Congestion Forecaster';
    this.version = '1.0.0';
    this.description = 'Predicts potential crowd congestion bottlenecks and gate surges';
    this.priority = 1; // Runs first
  }

  validate(frame) {
    return super.validate(frame) && Array.isArray(frame.crowd?.entities);
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
        reasoning: ['Validation failed: Missing crowd telemetry.'],
        metrics: {}
      };
    }

    const crowdData = frame.crowd.entities;
    const totalOccupancy = frame.crowd.metrics?.totalOccupancy || 0;
    
    // Find highly congested zones (occupancy > 75%)
    const congestedZones = crowdData.filter(z => z.occupancy > 75);
    const hasCongestion = congestedZones.length > 0;
    const severity = totalOccupancy > 85 ? 'HIGH' : hasCongestion ? 'MEDIUM' : 'LOW';

    // Calculate deterministic confidence centrally using context helper
    const confidenceScore = this.context.confidenceCalculator({
      dataQuality: 0.95,
      environmentalUncertainty: frame.weather?.entities?.humidity > 80 ? 0.2 : 0.0,
      simulationStability: 1.0,
      historicalAccuracy: 0.92,
      predictionVariance: hasCongestion ? 0.1 : 0.0
    });

    const predictions = congestedZones.map(z => ({
      zone: z.zone,
      type: 'SURGE_RISK',
      etaMinutes: 15,
      probability: parseFloat((z.occupancy / 100).toFixed(2))
    }));

    const recommendations = [];
    const reasoningSteps = [];
    
    if (hasCongestion) {
      reasoningSteps.push(`Stadium occupancy stands at ${totalOccupancy}% with specific zones exceeding safety limits.`);
      reasoningSteps.push(`Congestion detected in: ${congestedZones.map(z => z.zone).join(', ')}.`);
      
      const trace = new DecisionTrace({
        contributingFactors: congestedZones.map(z => `${z.zone} occupancy is ${z.occupancy}%`),
        reasoningSteps: [
          'Safety occupancy limit threshold of 75% crossed',
          'Linear extrapolation projects bottleneck choke points in 15 minutes'
        ],
        assumptions: ['Crowd walking velocity remains at standard 1.2 m/s', 'Inflow vectors are constant'],
        confidence: confidenceScore,
        generatedBy: this.id,
        executionTime: performance.now() - startTime,
        timestamp: frame.simulationTime
      });

      recommendations.push({
        id: `REC-CP-${frame.tick}`,
        type: 'CROWD_DIVERSION',
        action: `Reroute secondary gate inflows away from congested areas: ${congestedZones.map(z => z.zone).join(', ')}`,
        trace
      });
    } else {
      reasoningSteps.push('Stadium crowd flow parameters remain within normal operational safety envelopes.');
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
      canAnalyzeCrowd: true,
      canAnalyzeThreats: false,
      canRouteResponders: false
    };
  }
}
export default CrowdPredictionEngine;
