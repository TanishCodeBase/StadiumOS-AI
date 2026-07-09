import { BaseManager } from '../core/base-manager.js';
import { logger } from '../diagnostics/logger.js';
import { createPRNG } from './random.js';
import { SimulationContext } from './simulation-context.js';
import { SimulationScheduler } from './scheduler.js';
import { workerManager } from '../workers/worker-manager.js';
import { EVENTS } from '../core/events.js';

// Behaviors
import { CrowdSimulation } from './behaviors/crowd.js';
import { TransitSimulation } from './behaviors/transit.js';
import { WeatherSimulation } from './behaviors/weather.js';
import { IncidentSimulation } from './behaviors/incident.js';
import { VolunteerSimulation } from './behaviors/volunteer.js';
import { TelemetrySimulation } from './behaviors/telemetry.js';

class SimulationManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.scheduler = new SimulationScheduler();
    this.simContext = null;
    this.currentSeed = 12345;
    
    this.behaviors = {
      CrowdSimulation: new CrowdSimulation(),
      TransitSimulation: new TransitSimulation(),
      WeatherSimulation: new WeatherSimulation(),
      IncidentSimulation: new IncidentSimulation(),
      VolunteerSimulation: new VolunteerSimulation(),
      TelemetrySimulation: new TelemetrySimulation()
    };

    this.tickPerformances = [];
    this.context = null;
    this.eventBus = null;
    this.config = null;
  }

  /**
   * Initializes SimulationManager using AppContext
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;
    this.eventBus = context.get('eventBus');
    this.config = context.get('config');

    this.currentSeed = this.config.SIMULATION?.SEEDS?.[0] || 12345;
    
    const randomFunc = createPRNG(this.currentSeed);
    
    // Create new simulation clock context
    this.simContext = new SimulationContext({
      random: randomFunc,
      config: this.config,
      clock: 0,
      currentSeed: this.currentSeed
    });

    // Initialize all behaviors
    Object.values(this.behaviors).forEach(behavior => {
      try {
        behavior.initialize(this.simContext);
      } catch (err) {
        logger.error('Simulation', `SimulationManager: Failed to initialize behavior ${behavior.constructor.name}`, err);
      }
    });

    // Spawn Web Worker
    workerManager.spawn();
    
    logger.info('Simulation', `SimulationManager: Initialized with seed ${this.currentSeed}`);
  }

  start() {
    if (!this.initialized) return;

    Object.values(this.behaviors).forEach(behavior => {
      try {
        behavior.start();
      } catch (err) {
        logger.error('Simulation', `SimulationManager: Failed to start behavior ${behavior.constructor.name}`, err);
      }
    });

    this.scheduler.start((deltaTime, simTime) => this.tick(deltaTime, simTime));
    logger.info('Simulation', 'SimulationManager: Simulation started.');
  }

  pause() {
    this.scheduler.pause();
    logger.info('Simulation', 'SimulationManager: Simulation paused.');
  }

  resume() {
    this.scheduler.resume();
    logger.info('Simulation', 'SimulationManager: Simulation resumed.');
  }

  stop() {
    this.scheduler.stop();
    Object.values(this.behaviors).forEach(behavior => {
      try {
        behavior.stop();
      } catch (err) {
        logger.error('Simulation', `SimulationManager: Failed to stop behavior ${behavior.constructor.name}`, err);
      }
    });
    logger.info('Simulation', 'SimulationManager: Simulation stopped.');
  }

  setSpeed(multiplier) {
    this.scheduler.setSpeed(multiplier);
  }

  setSeed(seed) {
    this.currentSeed = seed;
    logger.info('Simulation', `SimulationManager: Seed updated to ${seed}. Re-initializing.`);
    
    const randomFunc = createPRNG(seed);
    this.simContext = new SimulationContext({
      random: randomFunc,
      config: this.config,
      clock: 0,
      currentSeed: seed
    });

    Object.values(this.behaviors).forEach(behavior => {
      try {
        behavior.initialize(this.simContext);
      } catch (err) {
        logger.error('Simulation', `SimulationManager: Failed to re-initialize behavior ${behavior.constructor.name}`, err);
      }
    });
  }

  tick(deltaTime, simTime) {
    if (!this.simContext) return;

    this.workerStatus = this.workerStatus || 'HEALTHY';
    this.workerLatencyMs = this.workerLatencyMs || 1.2;

    // Simulate realistic worker status progression over tick loops
    const randVal = this.simContext.random();
    if (this.workerStatus === 'HEALTHY') {
      if (randVal < 0.04) {
        this.workerStatus = 'BUSY';
        this.workerLatencyMs = 5.2 + this.simContext.random() * 2;
      } else if (randVal < 0.05) {
        this.workerStatus = 'FAULTED';
        this.workerLatencyMs = 35.0;
      } else {
        this.workerLatencyMs = 1.0 + this.simContext.random() * 0.5;
      }
    } else if (this.workerStatus === 'BUSY') {
      if (randVal < 0.3) {
        this.workerStatus = 'HEALTHY';
        this.workerLatencyMs = 1.2;
      } else {
        this.workerLatencyMs = 5.2 + this.simContext.random() * 2;
      }
    } else if (this.workerStatus === 'FAULTED') {
      this.workerStatus = 'RESTARTING';
      this.workerLatencyMs = 40.0;
    } else if (this.workerStatus === 'RESTARTING') {
      this.workerStatus = 'RECOVERING';
      this.workerLatencyMs = 20.0;
    } else if (this.workerStatus === 'RECOVERING') {
      this.workerStatus = 'HEALTHY';
      this.workerLatencyMs = 1.2;
    }

    const tickStart = performance.now();
    this.simContext.clock = simTime;

    const behaviorOutputs = {};
    Object.entries(this.behaviors).forEach(([name, behavior]) => {
      try {
        behaviorOutputs[name] = behavior.tick(deltaTime);
      } catch (err) {
        logger.error('Simulation', `SimulationManager: Error executing tick on behavior ${name}`, err);
      }
    });

    const executionDuration = performance.now() - tickStart;

    const simulationFrame = {
      timestamp: simTime,
      seed: this.currentSeed,
      metrics: {
        executionTimeMs: executionDuration,
        workerStatus: this.workerStatus,
        workerLatencyMs: parseFloat(this.workerLatencyMs.toFixed(2))
      },
      behaviors: behaviorOutputs
    };

    this.tickPerformances.push(executionDuration);
    if (this.tickPerformances.length > 100) this.tickPerformances.shift();

    workerManager.queueTask('PROCESS_FRAME', simulationFrame)
      .then((processedFrame) => {
        if (this.eventBus) {
          this.eventBus.publish(EVENTS.SIMULATION.SIMULATION_FRAME, processedFrame);
        }
      })
      .catch((err) => {
        logger.error('Simulation', 'SimulationManager: Error processing frame in worker', err);
        if (this.eventBus) {
          this.eventBus.publish(EVENTS.SIMULATION.SIMULATION_FRAME, simulationFrame);
        }
      });
  }

  dispose() {
    this.stop();
    workerManager.terminate();
    this.simContext = null;
    this.context = null;
    this.eventBus = null;
    this.config = null;
    super.dispose();
  }

  getDiagnostics() {
    const averageTickTime = this.tickPerformances.length > 0
      ? this.tickPerformances.reduce((a, b) => a + b, 0) / this.tickPerformances.length
      : 0;

    return {
      isPlaying: this.scheduler.isPlaying,
      speed: this.scheduler.speed,
      clock: this.scheduler.simClock,
      seed: this.currentSeed,
      averageTickTimeMs: parseFloat(averageTickTime.toFixed(2))
    };
  }
}

export const simulationManager = new SimulationManager();
export default simulationManager;
