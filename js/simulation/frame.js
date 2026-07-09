/**
 * Helper to recursively freeze nested objects.
 * @param {object} object 
 * @returns {object}
 */
export function deepFreeze(object) {
  if (object === null || object === undefined) return object;

  const propNames = Object.getOwnPropertyNames(object);

  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}

/**
 * StadiumOS AI - Simulation Frame
 * Immutable snapshot of the simulated world at a specific timestep
 */
export class SimulationFrame {
  constructor({ tick, simulationTime, crowd, transit, weather, incidents, volunteers, telemetry }) {
    this.tick = typeof tick === 'number' ? tick : 0;
    this.simulationTime = typeof simulationTime === 'number' ? simulationTime : 0;
    
    // Versioning parameters
    this.frameVersion = '1.0.0';
    this.schemaVersion = '1.0.0';

    // Structured behaviors data
    this.crowd = crowd || { entities: [], metrics: {}, events: [] };
    this.transit = transit || { entities: [], metrics: {}, events: [] };
    this.weather = weather || { entities: {}, metrics: {}, events: [] };
    this.incidents = incidents || { entities: [], metrics: {}, events: [] };
    this.volunteers = volunteers || { entities: [], metrics: {}, events: [] };
    this.telemetry = telemetry || { entities: [], metrics: {}, events: [] };

    // Deep freeze all behaviors data to enforce deep immutability
    deepFreeze(this.crowd);
    deepFreeze(this.transit);
    deepFreeze(this.weather);
    deepFreeze(this.incidents);
    deepFreeze(this.volunteers);
    deepFreeze(this.telemetry);

    // Freeze self
    Object.freeze(this);
  }
}
export default SimulationFrame;
