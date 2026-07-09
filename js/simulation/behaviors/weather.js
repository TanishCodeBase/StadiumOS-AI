export class WeatherSimulation {
  constructor() {
    this.context = null;
    this.temperature = 22.0; // celsius
    this.humidity = 60.0; // percent
    this.precipitation = 0.0;
    this.windSpeed = 10.0; // km/h
  }

  initialize(context) {
    this.context = context;
    // Set seed based values
    this.temperature = 18.0 + context.random() * 10;
    this.humidity = 50.0 + context.random() * 25;
    this.windSpeed = 5.0 + context.random() * 15;
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    // Gradual weather updates
    this.temperature += (this.context.random() * 0.2 - 0.1) * deltaTime;
    this.humidity += (this.context.random() * 0.4 - 0.2) * deltaTime;
    this.windSpeed += (this.context.random() * 0.6 - 0.3) * deltaTime;

    this.temperature = parseFloat(Math.max(10, Math.min(40, this.temperature)).toFixed(1));
    this.humidity = parseFloat(Math.max(10, Math.min(100, this.humidity)).toFixed(1));
    this.windSpeed = parseFloat(Math.max(0, Math.min(50, this.windSpeed)).toFixed(1));

    const events = [];
    if (this.temperature > 30 && this.context.random() < 0.02) {
      events.push({
        id: `EVT-${Math.floor(this.context.random() * 10000)}`,
        type: 'HEAT_ALERT',
        message: 'Extreme temperature detected. Deploying cooling stations.'
      });
    }

    return {
      source: 'WeatherSimulation',
      timestamp: this.context.clock,
      entities: {
        condition: this.humidity > 80 ? 'RAIN' : 'CLEAR',
        temperature: this.temperature,
        humidity: this.humidity,
        windSpeed: this.windSpeed
      },
      metrics: {
        heatIndex: parseFloat((this.temperature + (this.humidity * 0.05)).toFixed(1))
      },
      events
    };
  }

  dispose() {
    this.context = null;
  }
}
export default WeatherSimulation;
