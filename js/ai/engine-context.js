/**
 * StadiumOS AI - Engine Context
 * Injected dependency container providing access to simulation clock,
 * configuration, and centralized confidence scoring to all engines.
 */
export class EngineContext {
  constructor({ config, clock, simulationTime, confidenceCalculator, diagnostics }) {
    this.config = config;
    this.clock = clock;                     // current tick number (simulation tick)
    this.simulationTime = simulationTime;   // total simulation clock time in seconds
    this.confidenceCalculator = confidenceCalculator; // function reference
    this.diagnostics = diagnostics || { fps: 60 };
    Object.freeze(this);
  }
}
export default EngineContext;
