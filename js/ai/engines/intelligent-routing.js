import { BaseEngine } from '../base-engine.js';
import { DecisionTrace } from '../decision-trace.js';

export class IntelligentRoutingEngine extends BaseEngine {
  constructor() {
    super();
    this.id = 'intelligent-routing';
    this.name = 'Emergency Dispatch Navigator';
    this.version = '1.0.0';
    this.description = 'Computes optimal emergency dispatch and evacuation routing vectors';
    this.priority = 3; // Runs third
  }

  validate(frame) {
    return super.validate(frame) && 
      Array.isArray(frame.incidents?.entities) && 
      Array.isArray(frame.telemetry?.entities);
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
        reasoning: ['Validation failed: Missing active responder coordinates.'],
        metrics: {}
      };
    }

    const incidents = frame.incidents.entities;
    const responders = frame.telemetry.entities;
    const activeCount = incidents.length;

    const confidenceScore = this.context.confidenceCalculator({
      dataQuality: 0.98,
      environmentalUncertainty: 0.0,
      simulationStability: 1.0,
      historicalAccuracy: 0.94,
      predictionVariance: 0.0
    });

    const predictions = [];
    const recommendations = [];
    const reasoningSteps = [];
    const routing = {};

    if (activeCount > 0) {
      reasoningSteps.push(`IntelligentRouting: Calculating dispatcher vectors for ${activeCount} incident locations.`);
      
      incidents.forEach((inc, idx) => {
        // Find closest responder in coordinate space
        let closestResponder = null;
        let minDistance = Infinity;

        // Simple mock coordinates representing incident locations for matching
        const incidentCoords = {
          'Gate 3': { x: 220, y: 170 },
          'Section 104': { x: 440, y: 310 },
          'Concourse B': { x: 310, y: 530 },
          'East Entrance': { x: 120, y: 410 },
          'West Parking Area': { x: 620, y: 240 }
        };

        const target = incidentCoords[inc.location] || { x: 400, y: 300 };

        responders.forEach(r => {
          const dx = r.x - target.x;
          const dy = r.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestResponder = r;
          }
        });

        if (closestResponder) {
          reasoningSteps.push(`Closest responder for ${inc.id} is ${closestResponder.id} (distance: ${Math.round(minDistance)}m).`);
          
          const trace = new DecisionTrace({
            contributingFactors: [
              `Incident ${inc.id} at ${inc.location} requires dispatch`,
              `Responder ${closestResponder.id} is closest in physical coordinates`
            ],
            reasoningSteps: [
              'Coordinate distance mapping query executed',
              'Assigned nearest unit to reduce latency vectors'
            ],
            assumptions: ['Responder corridors are free of blockage', 'Speed parameters are linear'],
            confidence: confidenceScore,
            generatedBy: this.id,
            executionTime: performance.now() - startTime,
            timestamp: frame.simulationTime
          });

          const recId = `REC-IR-${frame.tick}-${idx}`;
          recommendations.push({
            id: recId,
            type: 'DISPATCH_CORRIDOR',
            action: `Dispatch ${closestResponder.id} to resolve ${inc.type} at ${inc.location}`,
            trace
          });

          // Save active routing vector coordinates
          routing[inc.id] = {
            responderId: closestResponder.id,
            origin: { x: closestResponder.x, y: closestResponder.y },
            destination: { x: target.x, y: target.y }
          };
        }
      });
    } else {
      reasoningSteps.push('Zero dispatch coordinates required. Responders holding positions.');
    }

    this._recordMetrics(startTime, confidenceScore);

    return {
      engine: this.id,
      timestamp: frame.simulationTime,
      confidence: confidenceScore,
      severity: activeCount > 2 ? 'HIGH' : activeCount > 0 ? 'MEDIUM' : 'LOW',
      predictions,
      recommendations,
      reasoning: reasoningSteps,
      routing,
      metrics: this.getMetrics()
    };
  }

  getCapabilities() {
    return {
      canAnalyzeCrowd: false,
      canAnalyzeThreats: false,
      canRouteResponders: true
    };
  }
}
export default IntelligentRoutingEngine;
