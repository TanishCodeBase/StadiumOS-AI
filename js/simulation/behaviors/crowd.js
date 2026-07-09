export class CrowdSimulation {
  constructor() {
    this.context = null;
    this.zones = ['North Stand', 'South Stand', 'East Stand', 'West Stand', 'VIP Club', 'Press Box'];
    this.occupancies = {};
  }

  initialize(context) {
    this.context = context;
    // Set deterministic initial values using the injected PRNG
    this.zones.forEach(zone => {
      this.occupancies[zone] = Math.floor(context.random() * 40) + 10; // start 10% - 50%
    });
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    // Shift occupancies slightly using context.random
    this.zones.forEach(zone => {
      const delta = (this.context.random() * 4 - 2) * deltaTime; // range -2% to +2%
      this.occupancies[zone] = Math.max(0, Math.min(100, Math.round(this.occupancies[zone] + delta)));
    });

    const totalOccupancy = Math.round(
      Object.values(this.occupancies).reduce((a, b) => a + b, 0) / this.zones.length
    );

    const events = [];
    if (totalOccupancy > 80 && this.context.random() < 0.05) {
      events.push({
        id: `EVT-${Math.floor(this.context.random() * 10000)}`,
        type: 'SURGE_WARNING',
        message: 'High overall stadium density detected.'
      });
    }

    return {
      source: 'CrowdSimulation',
      timestamp: this.context.clock,
      entities: Object.entries(this.occupancies).map(([zone, occupancy]) => ({ zone, occupancy })),
      metrics: {
        totalOccupancy,
        inflowRate: Math.round(this.context.random() * 50) + 10 // fans per minute
      },
      events
    };
  }

  dispose() {
    this.context = null;
  }
}
export default CrowdSimulation;
