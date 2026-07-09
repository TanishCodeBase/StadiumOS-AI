export class VolunteerSimulation {
  constructor() {
    this.context = null;
    this.sectors = ['Sector A', 'Sector B', 'Sector C', 'Sector D'];
    this.allocations = {};
  }

  initialize(context) {
    this.context = context;
    this.sectors.forEach(sector => {
      this.allocations[sector] = {
        available: Math.floor(context.random() * 15) + 10,
        assigned: Math.floor(context.random() * 10) + 5,
        working: Math.floor(context.random() * 8) + 2,
        returning: Math.floor(context.random() * 5) + 1
      };
    });
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    // Transition volunteer lifecycles gradually over tick frames
    this.sectors.forEach(sector => {
      const data = this.allocations[sector];
      
      // 1. Shift Available ➔ Assigned
      if (data.available > 0 && this.context.random() < 0.15) {
        data.available--;
        data.assigned++;
      }
      // 2. Shift Assigned ➔ Working
      if (data.assigned > 0 && this.context.random() < 0.20) {
        data.assigned--;
        data.working++;
      }
      // 3. Shift Working ➔ Returning
      if (data.working > 0 && this.context.random() < 0.10) {
        data.working--;
        data.returning++;
      }
      // 4. Shift Returning ➔ Available
      if (data.returning > 0 && this.context.random() < 0.25) {
        data.returning--;
        data.available++;
      }
    });

    const totalActive = Object.values(this.allocations).reduce((sum, item) => sum + item.working + item.assigned, 0);
    const totalStandby = Object.values(this.allocations).reduce((sum, item) => sum + item.available + item.returning, 0);

    return {
      source: 'VolunteerSimulation',
      timestamp: this.context.clock,
      entities: Object.entries(this.allocations).map(([sector, data]) => ({
        sector,
        active: data.working + data.assigned,
        standby: data.available + data.returning,
        working: data.working,
        returning: data.returning,
        available: data.available
      })),
      metrics: {
        totalStaffed: totalActive + totalStandby,
        activeRatio: parseFloat((totalActive / (totalActive + totalStandby || 1)).toFixed(2))
      },
      events: []
    };
  }

  dispose() {
    this.context = null;
    this.allocations = {};
  }
}
export default VolunteerSimulation;
