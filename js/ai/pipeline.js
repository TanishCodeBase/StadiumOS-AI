import { BaseManager } from '../core/base-manager.js';
import { logger } from '../diagnostics/logger.js';
import { SimulationFrame } from '../simulation/frame.js';
import { DecisionFrame } from './decision-frame.js';
import { EngineContext } from './engine-context.js';
import { calculateConfidence } from './confidence.js';
import { EVENTS } from '../core/events.js';

class AiPipeline extends BaseManager {
  constructor() {
    super('1.0.0');
    this.unsubscribeEventBus = null;
    
    // Performance counters
    this.framesProcessedCount = 0;
    this.framesSkippedCount = 0;
    this.totalPipelineRuntime = 0;
    this.totalDecisionCount = 0;
    this.lastExecutionTimestamp = 0;
    this.lastPipelineDuration = 0;
    this.pipelineConfidenceSum = 0;

    this.activeRecommendations = new Map();
    this.activePredictions = [];
    this.lastConfidence = null;

    this.context = null;
    this.eventBus = null;
    this.aiRegistry = null;
    this.engineMetrics = null;
    this.config = null;
  }

  /**
   * Initializes pipeline subscriptions and metrics registrar
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;
    this.eventBus = context.get('eventBus');
    this.aiRegistry = context.get('aiRegistry');
    this.engineMetrics = context.get('engineMetrics');
    this.config = context.get('config');

    // Subscribe to Simulation Frame event constant
    this.unsubscribeEventBus = this.eventBus.subscribe(EVENTS.SIMULATION.SIMULATION_FRAME, (rawFrame) => {
      this.execute(rawFrame);
    });

    logger.info('AI', 'AiPipeline: Successfully initialized and subscribed to simulation frame');
  }

  beforePipeline(frame) {
    logger.debug('AI', `AiPipeline: Executing beforePipeline for tick ${frame.tick}`);
  }

  beforeEngine(engine, frame) {
    logger.debug('AI', `AiPipeline: Executing beforeEngine for '${engine.id}' at tick ${frame.tick}`);
  }

  afterEngine(engine, result) {
    logger.debug('AI', `AiPipeline: Executing afterEngine for '${engine.id}' (confidence: ${result.confidence})`);
  }

  afterPipeline(decisionFrame) {
    logger.debug('AI', `AiPipeline: Executing afterPipeline for tick ${decisionFrame.simulationTick}`);
  }

  /**
   * Orchestrates the AI pipeline execution flow
   * @param {object} rawFrame 
   */
  execute(rawFrame) {
    const startTime = performance.now();

    // 1. Frame wrapper and validation
    let simFrame;
    try {
      simFrame = new SimulationFrame({
        tick: rawFrame.timestamp,
        simulationTime: rawFrame.timestamp,
        crowd: rawFrame.behaviors?.CrowdSimulation,
        transit: rawFrame.behaviors?.TransitSimulation,
        weather: rawFrame.behaviors?.WeatherSimulation,
        incidents: rawFrame.behaviors?.IncidentSimulation,
        volunteers: rawFrame.behaviors?.VolunteerSimulation,
        telemetry: rawFrame.behaviors?.TelemetrySimulation
      });
    } catch (err) {
      this.framesSkippedCount++;
      logger.error('AI', 'AiPipeline: Aborted, failed to wrap SimulationFrame', err);
      return;
    }

    if (simFrame.simulationTime === undefined || simFrame.simulationTime < 0) {
      this.framesSkippedCount++;
      logger.warn('AI', 'AiPipeline: Bypassed frame, invalid simulationTime timestamp.');
      return;
    }

    this.beforePipeline(simFrame);

    // 2. Build EngineContext with push-based diagnostics link
    const engineContext = new EngineContext({
      config: this.config,
      clock: simFrame.tick,
      simulationTime: simFrame.simulationTime,
      confidenceCalculator: calculateConfidence,
      diagnostics: {
        fps: 60,
        recordMetric: (engineId, durationMs, confidence, success, warning) => {
          if (this.engineMetrics) {
            this.engineMetrics.record(engineId, durationMs, confidence, success, warning);
          }
        }
      }
    });

    const engines = this.aiRegistry.getAll();
    if (engines.length === 0) {
      this.framesSkippedCount++;
      logger.debug('AI', 'AiPipeline: Execution bypassed, zero engines registered.');
      return;
    }

    const engineOutputs = {};
    const rawPredictions = [];
    const rawRecommendations = [];
    const reasoning = [];
    const alerts = [];
    let routing = {};

    let totalConfidence = 0;
    let activeEnginesCount = 0;
    
    const SEVERITY_LEVELS = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    let highestSeverityVal = 0;

    // 3. Sequential execute following priority order
    engines.forEach(engine => {
      engine.initialize(engineContext);
      
      this.beforeEngine(engine, simFrame);

      if (!engine.validate(simFrame)) {
        logger.warn('AI', `AiPipeline: Engine '${engine.id}' validation failed.`);
        if (this.engineMetrics) {
          this.engineMetrics.record(engine.id, 0, 0, false, true);
        }
        return;
      }

      try {
        const output = engine.analyze(simFrame);
        
        engineOutputs[engine.id] = output;
        
        if (output.predictions) {
          output.predictions.forEach(pred => {
            rawPredictions.push({
              ...pred,
              tick: simFrame.tick
            });
          });
        }
        if (output.recommendations) {
          rawRecommendations.push(...output.recommendations);
        }
        
        if (output.reasoning) reasoning.push(...output.reasoning);
        if (output.routing) routing = { ...routing, ...output.routing };

        totalConfidence += output.confidence;
        activeEnginesCount++;

        const sevVal = SEVERITY_LEVELS[output.severity] || 0;
        if (sevVal > highestSeverityVal) {
          highestSeverityVal = sevVal;
        }

        this.afterEngine(engine, output);
      } catch (err) {
        logger.error('AI', `AiPipeline: Runtime error executing engine '${engine.id}'`, err);
        if (this.engineMetrics) {
          this.engineMetrics.record(engine.id, 0, 0, false, false);
        }
      }
    });

    // 3a. Evolve Recommendation Lifecycles
    this.activeRecommendations.forEach((entry, key) => {
      if (entry.status === 'Generated') {
        entry.status = 'Pending Review';
      } else if (entry.status === 'Pending Review') {
        entry.status = 'Approved';
      } else if (entry.status === 'Approved') {
        entry.status = 'Executing';
      } else if (entry.status === 'Executing') {
        entry.status = 'Completed';
      } else if (entry.status === 'Completed') {
        entry.completedTicks++;
        if (entry.completedTicks >= 2) {
          this.activeRecommendations.delete(key);
        }
      }
    });

    rawRecommendations.forEach((rec, idx) => {
      const key = `${rec.type}-${rec.action}`;
      if (!this.activeRecommendations.has(key)) {
        const decId = `DEC-${rec.type}-${simFrame.tick}-${idx}`;
        this.activeRecommendations.set(key, {
          id: rec.id || `REC-${rec.type}-${simFrame.tick}`,
          type: rec.type,
          action: rec.action,
          decisionId: decId,
          timestamp: simFrame.simulationTime,
          status: 'Generated',
          completedTicks: 0,
          trace: rec.trace
        });
      }
    });

    const recommendations = [];
    const decisions = [];
    const actions = [];

    this.activeRecommendations.forEach(entry => {
      recommendations.push({
        id: entry.id,
        type: entry.type,
        action: entry.action,
        trace: entry.trace,
        decisionId: entry.decisionId,
        parentDecision: null,
        generatedBy: 'ai-pipeline',
        timestamp: entry.timestamp,
        status: entry.status
      });

      decisions.push({
        decisionId: entry.decisionId,
        parentDecision: null,
        generatedBy: 'ai-pipeline',
        timestamp: entry.timestamp,
        status: entry.status,
        conclusion: entry.action
      });

      actions.push({
        decisionId: entry.decisionId,
        timestamp: entry.timestamp,
        status: entry.status
      });
    });

    // 3b. Prediction Aging (expire old predictions > 3 ticks)
    this.activePredictions = [
      ...this.activePredictions.filter(p => simFrame.tick - p.tick <= 3),
      ...rawPredictions
    ];

    const predictions = this.activePredictions.map(p => ({
      zone: p.zone,
      type: p.type,
      etaMinutes: p.etaMinutes,
      probability: p.probability
    }));

    const threatLevelKeys = ['LOW', 'MEDIUM', 'HIGH'];
    const threatLevel = threatLevelKeys[highestSeverityVal];
    let overallConfidence = activeEnginesCount > 0 
      ? parseFloat((totalConfidence / activeEnginesCount).toFixed(2)) 
      : 1.0;

    // Apply smooth confidence drift filter
    if (this.lastConfidence !== undefined && this.lastConfidence !== null) {
      overallConfidence = this.lastConfidence + (overallConfidence - this.lastConfidence) * 0.15;
    }
    this.lastConfidence = overallConfidence;
    overallConfidence = parseFloat(overallConfidence.toFixed(2));

    const pipelineDuration = performance.now() - startTime;
    
    this.framesProcessedCount++;
    this.totalPipelineRuntime += pipelineDuration;
    this.lastPipelineDuration = pipelineDuration;
    this.lastExecutionTimestamp = Date.now();
    this.pipelineConfidenceSum += overallConfidence;
    this.totalDecisionCount += decisions.length;

    // 4. Build DecisionFrame
    const decisionFrame = new DecisionFrame({
      timestamp: simFrame.simulationTime,
      simulationTick: simFrame.tick,
      threatLevel,
      overallConfidence,
      predictions,
      decisions,
      recommendations,
      actions,
      routing,
      alerts,
      reasoning,
      metrics: {
        executionTimeMs: pipelineDuration,
        averagePipelineDurationMs: this.totalPipelineRuntime / this.framesProcessedCount
      },
      engineOutputs
    });

    this.afterPipeline(decisionFrame);

    // 5. Publish to EventBus
    if (this.eventBus) {
      this.eventBus.publish(EVENTS.AI.AI_DECISION_FRAME, decisionFrame);
    }
  }

  getMetrics() {
    const avgRuntime = this.framesProcessedCount > 0
      ? this.totalPipelineRuntime / this.framesProcessedCount
      : 0;
    const avgConfidence = this.framesProcessedCount > 0
      ? this.pipelineConfidenceSum / this.framesProcessedCount
      : 0;

    const engineStats = this.engineMetrics ? this.engineMetrics.getMetrics() : {};
    const engineFailures = Object.values(engineStats).reduce((sum, item) => sum + item.failureCount, 0);

    return {
      averageRuntimeMs: parseFloat(avgRuntime.toFixed(3)),
      framesProcessed: this.framesProcessedCount,
      framesSkipped: this.framesSkippedCount,
      averageConfidence: parseFloat(avgConfidence.toFixed(3)),
      decisionCount: this.totalDecisionCount,
      engineFailures,
      lastExecutionTimeMs: parseFloat(this.lastPipelineDuration.toFixed(3)),
      lastExecutionTimestamp: this.lastExecutionTimestamp
    };
  }

  reset() {
    this.framesProcessedCount = 0;
    this.framesSkippedCount = 0;
    this.totalPipelineRuntime = 0;
    this.totalDecisionCount = 0;
    this.lastExecutionTimestamp = 0;
    this.lastPipelineDuration = 0;
    this.pipelineConfidenceSum = 0;
    if (this.engineMetrics) {
      this.engineMetrics.reset();
    }
    logger.info('AI', 'AiPipeline: Reset performance metrics counters');
  }

  dispose() {
    if (this.unsubscribeEventBus) {
      this.unsubscribeEventBus();
      this.unsubscribeEventBus = null;
    }
    this.context = null;
    this.eventBus = null;
    this.aiRegistry = null;
    this.engineMetrics = null;
    this.config = null;
    super.dispose();
  }

  getDiagnostics() {
    return this.getMetrics();
  }
}

export const aiPipeline = new AiPipeline();
export default aiPipeline;
