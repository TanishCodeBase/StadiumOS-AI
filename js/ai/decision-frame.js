import { deepFreeze } from '../simulation/frame.js';

/**
 * StadiumOS AI - Decision Frame
 * Immutable output aggregate from the AI analytical pipeline execution
 */
export class DecisionFrame {
  constructor({
    timestamp,
    simulationTick,
    threatLevel,
    overallConfidence,
    predictions,
    decisions,
    recommendations,
    actions,
    routing,
    alerts,
    reasoning,
    metrics,
    engineOutputs
  }) {
    this.timestamp = typeof timestamp === 'number' ? timestamp : 0;
    this.simulationTick = typeof simulationTick === 'number' ? simulationTick : 0;
    
    // Compatibility versions
    this.decisionVersion = '1.0.0';
    this.schemaVersion = '1.0.0';

    this.threatLevel = threatLevel || 'LOW';
    this.overallConfidence = typeof overallConfidence === 'number' ? overallConfidence : 1.0;
    
    // Segregated AI concepts
    this.predictions = predictions || [];       // Forecasts
    this.decisions = decisions || [];           // Internal AI conclusions
    this.recommendations = recommendations || []; // Suggested operator response
    this.actions = actions || [];               // Operator actions state

    this.routing = routing || {};
    this.alerts = alerts || [];
    this.reasoning = reasoning || [];
    
    // Performance & Diagnostics logs
    this.metrics = metrics || { executionTimeMs: 0 };
    this.engineOutputs = engineOutputs || {};

    // Deep freeze fields
    deepFreeze(this.predictions);
    deepFreeze(this.decisions);
    deepFreeze(this.recommendations);
    deepFreeze(this.actions);
    deepFreeze(this.routing);
    deepFreeze(this.alerts);
    deepFreeze(this.reasoning);
    deepFreeze(this.metrics);
    deepFreeze(this.engineOutputs);
    
    // Freeze self
    Object.freeze(this);
  }
}
export default DecisionFrame;
