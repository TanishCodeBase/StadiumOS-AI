import { logger } from '../diagnostics/logger.js';

export class BaseEngine {
  constructor() {
    // Metadata properties
    this.id = 'base-engine';
    this.name = 'Base AI Engine';
    this.version = '1.0.0';
    this.description = 'Abstract base AI decision engine class';
    this.priority = 99;

    // Injected context reference
    this.context = null;

    // Local telemetry logs
    this.executionCount = 0;
    this.totalExecutionTime = 0;
    this.lastExecutionTime = 0;
    this.lastConfidence = 1.0;
    this.lastRunTimestamp = 0;
    this.failureCount = 0;
    this.warningCount = 0;
  }

  /**
   * Initializes the engine with the injected context
   * @param {EngineContext} context 
   */
  initialize(context) {
    this.context = context;
    logger.debug('AI', `Engine [${this.name}]: Initialized`);
  }

  /**
   * Validates simulation frame data compatibility
   * @param {SimulationFrame} frame 
   * @returns {boolean}
   */
  validate(frame) {
    if (!frame) return false;
    return true;
  }

  /**
   * Abstract analysis hook. Subclasses override.
   * @param {SimulationFrame} frame 
   */
  analyze(frame) {
    throw new Error('AI Engine subclasses must implement analyze()');
  }

  /**
   * Disposes of reference allocations
   */
  dispose() {
    this.context = null;
    logger.debug('AI', `Engine [${this.name}]: Disposed`);
  }

  /**
   * Returns diagnostic stats for health dashboarding
   * @returns {object}
   */
  getMetrics() {
    const averageExecutionTime = this.executionCount - this.failureCount > 0
      ? this.totalExecutionTime / (this.executionCount - this.failureCount)
      : 0;

    return {
      executionCount: this.executionCount,
      averageExecutionTimeMs: parseFloat(averageExecutionTime.toFixed(3)),
      lastExecutionTimeMs: parseFloat(this.lastExecutionTime.toFixed(3)),
      lastConfidence: this.lastConfidence,
      lastRunTimestamp: this.lastRunTimestamp,
      failureCount: this.failureCount,
      warningCount: this.warningCount
    };
  }

  /**
   * Returns specific capability flags for UI discovery
   * @returns {object}
   */
  getCapabilities() {
    return {
      prediction: false,
      routing: false,
      threat: false,
      explainability: true
    };
  }

  /**
   * Internal telemetry recorder helper
   */
  _recordMetrics(startTime, confidence, success = true, warning = false) {
    const duration = performance.now() - startTime;
    this.executionCount++;
    
    if (success) {
      this.lastExecutionTime = duration;
      this.totalExecutionTime += duration;
      this.lastConfidence = confidence;
      this.lastRunTimestamp = this.context ? this.context.simulationTime : 0;
    } else {
      this.failureCount++;
    }

    if (warning) {
      this.warningCount++;
    }

    // Push metrics into the centralized metrics manager
    if (this.context && this.context.diagnostics && typeof this.context.diagnostics.recordMetric === 'function') {
      this.context.diagnostics.recordMetric(this.id, duration, confidence, success, warning);
    }
  }
}
export default BaseEngine;
