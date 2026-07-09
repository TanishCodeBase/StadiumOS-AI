/**
 * StadiumOS AI - Simulation Context
 * Dependency injection wrapper containing immutable services for behaviors
 */
export class SimulationContext {
  constructor({ random, config, clock, currentSeed }) {
    this.random = random;       // Mulberry32 function reference
    this.config = config;       // App configurations
    this.clock = clock;         // Deterministic virtual clock time in seconds
    this.currentSeed = currentSeed;
  }
}
export default SimulationContext;
