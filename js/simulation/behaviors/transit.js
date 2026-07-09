export class TransitSimulation {
  constructor() {
    this.context = null;
    this.lines = ['Red Line Metro', 'Blue Shuttle', 'West Parking Shuttle', 'Green Express'];
    this.transitStates = {};
  }

  initialize(context) {
    this.context = context;
    this.lines.forEach(line => {
      this.transitStates[line] = {
        status: 'ON_TIME',
        etaMin: Math.floor(context.random() * 8) + 1,
        loadFactor: Math.floor(context.random() * 50) + 20 // 20% - 70%
      };
    });
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    this.lines.forEach(line => {
      const state = this.transitStates[line];
      
      // Countdown eta gradually
      state.etaMin -= (deltaTime / 60) * 1.5; 
      
      // Drift load factors gradually (+/- 3%)
      const loadDrift = Math.floor(this.context.random() * 7) - 3;
      state.loadFactor = Math.min(95, Math.max(10, state.loadFactor + loadDrift));

      if (state.etaMin <= 0) {
        state.etaMin = Math.floor(this.context.random() * 10) + 3; // reset next train
        
        // Evolve delay status naturally
        if (state.status === 'DELAYED') {
          // 40% chance to recover delay
          if (this.context.random() < 0.4) {
            state.status = 'ON_TIME';
          }
        } else {
          // 10% chance to become delayed
          if (this.context.random() < 0.1) {
            state.status = 'DELAYED';
          }
        }
      }
    });

    const averageLoad = Math.round(
      Object.values(this.transitStates).reduce((sum, current) => sum + current.loadFactor, 0) / this.lines.length
    );

    return {
      source: 'TransitSimulation',
      timestamp: this.context.clock,
      entities: Object.entries(this.transitStates).map(([line, val]) => ({
        line,
        status: val.status,
        etaMin: parseFloat(val.etaMin.toFixed(1)),
        loadFactor: val.loadFactor
      })),
      metrics: {
        averageLoad,
        activeVehicles: this.lines.length
      },
      events: []
    };
  }

  dispose() {
    this.context = null;
    this.transitStates = {};
  }
}
export default TransitSimulation;
