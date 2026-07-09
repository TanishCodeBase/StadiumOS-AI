import { BaseModel } from './base-model.js';

export class WeatherState extends BaseModel {
  constructor({ temp, humidity, condition }) {
    super('WEATHER_STATE');
    this.temp = temp;
    this.humidity = humidity;
    this.condition = condition;
  }

  validate() {
    if (typeof this.temp !== 'number' || isNaN(this.temp)) return false;
    if (typeof this.humidity !== 'number' || isNaN(this.humidity) || this.humidity < 0 || this.humidity > 100) return false;
    if (typeof this.condition !== 'string' || !this.condition.trim()) return false;
    return true;
  }

  static from(raw) {
    if (!raw) return null;
    return new WeatherState({
      temp: raw.temp,
      humidity: raw.humidity,
      condition: raw.condition
    });
  }
}
export default WeatherState;
