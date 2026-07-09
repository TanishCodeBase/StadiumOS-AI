import { Recommendation } from '../../models/Recommendation.js';

export class RouteViewModel {
  constructor(decisionFrame) {
    this.recommendations = [];
    this.routing = {};

    if (decisionFrame) {
      this.routing = decisionFrame.routing || {};
      const rawRecs = decisionFrame.recommendations || [];
      this.recommendations = rawRecs.map(r => Recommendation.from(r)).filter(Boolean);
    }
  }

  hasActiveRoute(routeId) {
    return !!this.routing[routeId];
  }

  getRouteStroke(routeId) {
    const route = this.routing[routeId];
    if (!route) return 'none';
    return route.critical ? '#ef4444' : '#3b82f6';
  }
}
export default RouteViewModel;
