export class HeatmapViewModel {
  constructor(crowdData) {
    this.points = [];

    if (crowdData && Array.isArray(crowdData.entities)) {
      this.points = crowdData.entities.map(z => {
        // Map zone name to world coordinates center inside stadium
        const coord = this._getZoneCenterCoordinate(z.zone);
        return {
          x: coord.x,
          y: coord.y,
          value: z.occupancy,
          radius: 35
        };
      });
    }
  }

  getHeatColor(value) {
    // Return HSL gradient values from green (120) to red (0)
    const hue = ((1 - value / 100) * 120).toString(10);
    return `hsla(${hue}, 100%, 50%, 0.45)`;
  }

  _getZoneCenterCoordinate(zoneName) {
    // Pre-calculated world coordinate centers for the 8 stadium zones
    switch (zoneName) {
      case 'North Stand': return { x: 300, y: 120 };
      case 'North East Stand': return { x: 420, y: 150 };
      case 'East Stand': return { x: 450, y: 250 };
      case 'South East Stand': return { x: 420, y: 350 };
      case 'South Stand': return { x: 300, y: 380 };
      case 'South West Stand': return { x: 180, y: 350 };
      case 'West Stand': return { x: 150, y: 250 };
      case 'North West Stand': return { x: 180, y: 150 };
      default: return { x: 300, y: 250 }; // Center pitch
    }
  }
}
export default HeatmapViewModel;
