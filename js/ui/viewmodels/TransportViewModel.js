export class TransportViewModel {
  constructor(latestFrame) {
    this.routes = [];
    const simTransit = latestFrame?.behaviors?.TransitSimulation?.entities || [];
    this.routes = simTransit.map(route => {
      const isTrain = route.line.includes('Metro');
      return {
        line: route.line,
        etaMin: route.etaMin,
        capacity: '400',
        delay: route.status === 'DELAYED' ? '8m' : '0m',
        status: route.status,
        queueLength: route.status === 'DELAYED' ? 140 : 45,
        platformUtilizationPercent: route.status === 'DELAYED' ? 85 : 35,
        occupancyPercent: route.status === 'DELAYED' ? 95 : isTrain ? 65 : 45
      };
    });
  }
}
export default TransportViewModel;
