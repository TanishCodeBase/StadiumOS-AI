export class TelemetrySimulation {
  constructor() {
    this.context = null;
    this.units = [];
  }

  initialize(context) {
    this.context = context;
    // Set seed-reproducible coordinates
    this.units = [
      { id: 'SEC-01', type: 'SECURITY', x: 200 + context.random() * 50, y: 150 + context.random() * 50 },
      { id: 'SEC-02', type: 'SECURITY', x: 450 + context.random() * 50, y: 300 + context.random() * 50 },
      { id: 'SEC-03', type: 'SECURITY', x: 300 + context.random() * 50, y: 550 + context.random() * 50 },
      { id: 'MED-01', type: 'MEDICAL', x: 100 + context.random() * 50, y: 400 + context.random() * 50 },
      { id: 'MED-02', type: 'MEDICAL', x: 600 + context.random() * 50, y: 250 + context.random() * 50 }
    ];
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    // Drifting coordinates using context.random
    this.units.forEach(unit => {
      unit.x += (this.context.random() * 10 - 5) * deltaTime;
      unit.y += (this.context.random() * 10 - 5) * deltaTime;
      
      // Boundaries check
      unit.x = Math.max(50, Math.min(750, unit.x));
      unit.y = Math.max(50, Math.min(550, unit.y));
    });

    return {
      source: 'TelemetrySimulation',
      timestamp: this.context.clock,
      entities: this.units.map(u => ({
        id: u.id,
        type: u.type,
        x: parseFloat(u.x.toFixed(1)),
        y: parseFloat(u.y.toFixed(1))
      })),
      metrics: {
        activeUnitsCount: this.units.length
      },
      events: []
    };
  }

  dispose() {
    this.context = null;
    this.units = [];
  }
}
export default TelemetrySimulation;
