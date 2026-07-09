import { logger } from '../diagnostics/logger.js';

export class SimulationScheduler {
  constructor() {
    this.isPlaying = false;
    this.speed = 1.0;
    this.simClock = 0; // accumulated simulation seconds
    this.lastTime = 0;
    this.accumulatorMs = 0;
    this.baseTickIntervalMs = 1000; // 1 tick = 1.0 simulation second
    this.animationFrameId = null;
    this.onTickCallback = null;
  }

  /**
   * Starts the master timing loop
   * @param {Function} onTick callback executed on every tick
   */
  start(onTick) {
    if (this.isPlaying) return;

    this.onTickCallback = onTick;
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.accumulatorMs = 0;
    
    logger.info('Simulation', 'SimulationScheduler: Scheduler started.');
    
    const loop = (timestamp) => {
      if (!this.isPlaying) return;

      const deltaMs = timestamp - this.lastTime;
      this.lastTime = timestamp;

      // Accumulate elapsed real time scaled by speed multiplier
      this.accumulatorMs += deltaMs * this.speed;

      // Trigger simulation ticks at fixed intervals
      while (this.accumulatorMs >= this.baseTickIntervalMs) {
        const simStepSeconds = this.baseTickIntervalMs / 1000;
        this.simClock += simStepSeconds;
        
        try {
          if (this.onTickCallback) {
            this.onTickCallback(simStepSeconds, this.simClock);
          }
        } catch (err) {
          logger.error('Simulation', 'SimulationScheduler: Error inside tick callback', err);
        }

        this.accumulatorMs -= this.baseTickIntervalMs;
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Pauses the loop, preserving accumulated time
   */
  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    logger.info('Simulation', 'SimulationScheduler: Scheduler paused.');
  }

  /**
   * Resumes simulation timing
   */
  resume() {
    if (this.isPlaying || !this.onTickCallback) return;
    this.start(this.onTickCallback);
    logger.info('Simulation', 'SimulationScheduler: Scheduler resumed.');
  }

  /**
   * Halts the loop and resets clock coordinates
   */
  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.simClock = 0;
    this.accumulatorMs = 0;
    this.onTickCallback = null;
    logger.info('Simulation', 'SimulationScheduler: Scheduler stopped.');
  }

  /**
   * Update speed multiplier
   * @param {number} multiplier 
   */
  setSpeed(multiplier) {
    if (typeof multiplier !== 'number' || multiplier <= 0) {
      logger.error('Simulation', `SimulationScheduler: Invalid speed multiplier '${multiplier}'`);
      return;
    }
    this.speed = multiplier;
    logger.info('Simulation', `SimulationScheduler: Speed set to ${multiplier}x`);
  }

  getSpeed() {
    return this.speed;
  }

  getSimTime() {
    return this.simClock;
  }

  reset() {
    this.simClock = 0;
    this.accumulatorMs = 0;
  }
}
export default SimulationScheduler;
