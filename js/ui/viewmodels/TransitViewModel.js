import { TransitRoute } from '../../models/TransitRoute.js';

export class TransitViewModel {
  constructor(transitData) {
    this.routes = [];

    const rawRoutes = Array.isArray(transitData) ? transitData : (transitData?.entities || []);
    this.routes = rawRoutes.map(r => TransitRoute.from(r)).filter(Boolean);
  }

  getRouteStatusColor(status) {
    switch (status) {
      case 'ON_TIME': return '#10b981'; // green
      case 'DELAYED': return '#f59e0b'; // orange
      case 'SUSPENDED': return '#ef4444'; // red
      default: return '#6b7280';
    }
  }

  getLoadColor(loadFactor) {
    if (loadFactor > 0.8) return '#ef4444'; // crowded red
    if (loadFactor > 0.5) return '#f59e0b'; // moderate orange
    return '#10b981'; // light green
  }
}
export default TransitViewModel;
