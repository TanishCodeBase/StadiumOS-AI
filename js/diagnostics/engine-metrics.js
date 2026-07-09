import { BaseManager } from '../core/base-manager.js';
import { RollingHistory } from '../utils/rolling-history.js';
import { logger } from './logger.js';

class EngineMetricsManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.stats = new Map();
    this.context = null;
  }

  /**
   * Initializes EngineMetricsManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();
    
    this.context = context;
  }

  register(engineId) {
    if (!this.stats.has(engineId)) {
      this.stats.set(engineId, {
        executionCount: 0,
        totalRuntimeMs: 0,
        totalConfidence: 0,
        maxRuntimeMs: 0,
        minRuntimeMs: Infinity,
        failureCount: 0,
        warningCount: 0,
        history: new RollingHistory(50)
      });
      logger.debug('System', `EngineMetrics: Registered engine stats tracking for '${engineId}'`);
    }
  }

  record(engineId, durationMs, confidence, success = true, warning = false) {
    if (!this.initialized) return;

    if (!this.stats.has(engineId)) {
      this.register(engineId);
    }

    const stat = this.stats.get(engineId);
    stat.executionCount++;
    
    if (success) {
      stat.totalRuntimeMs += durationMs;
      stat.totalConfidence += confidence;
      stat.maxRuntimeMs = Math.max(stat.maxRuntimeMs, durationMs);
      stat.minRuntimeMs = Math.min(stat.minRuntimeMs, durationMs);
    } else {
      stat.failureCount++;
    }

    if (warning) {
      stat.warningCount++;
    }

    stat.history.push({
      timestamp: Date.now(),
      durationMs,
      confidence,
      success,
      warning
    });
  }

  getMetrics() {
    const aggregate = {};
    for (const [id, stat] of this.stats.entries()) {
      const avgRuntime = stat.executionCount - stat.failureCount > 0
        ? stat.totalRuntimeMs / (stat.executionCount - stat.failureCount)
        : 0;
      const avgConfidence = stat.executionCount - stat.failureCount > 0
        ? stat.totalConfidence / (stat.executionCount - stat.failureCount)
        : 0;

      aggregate[id] = {
        executionCount: stat.executionCount,
        averageRuntimeMs: parseFloat(avgRuntime.toFixed(3)),
        averageConfidence: parseFloat(avgConfidence.toFixed(3)),
        maxRuntimeMs: stat.maxRuntimeMs === 0 ? 0 : parseFloat(stat.maxRuntimeMs.toFixed(3)),
        minRuntimeMs: stat.minRuntimeMs === Infinity ? 0 : parseFloat(stat.minRuntimeMs.toFixed(3)),
        failureCount: stat.failureCount,
        warningCount: stat.warningCount,
        recentHistory: stat.history.toArray()
      };
    }
    return aggregate;
  }

  reset() {
    for (const stat of this.stats.values()) {
      stat.executionCount = 0;
      stat.totalRuntimeMs = 0;
      stat.totalConfidence = 0;
      stat.maxRuntimeMs = 0;
      stat.minRuntimeMs = Infinity;
      stat.failureCount = 0;
      stat.warningCount = 0;
      stat.history.clear();
    }
    logger.info('System', 'EngineMetrics: Reset stats metrics history');
  }

  dispose() {
    this.reset();
    this.stats.clear();
    this.context = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      enginesTrackedCount: this.stats.size
    };
  }
}

export const engineMetrics = new EngineMetricsManager();
export default engineMetrics;
