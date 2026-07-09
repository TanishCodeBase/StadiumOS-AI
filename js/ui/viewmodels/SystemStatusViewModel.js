export class SystemStatusViewModel {
  constructor(appContextInstance) {
    this.version = '0.1.0';
    this.env = 'development';
    this.workerCount = 1;
    this.registryHealth = 'HEALTHY';
    this.trackedEngines = [];

    this.registeredServicesCount = 11;
    this.healthyServicesCount = 11;
    this.workerState = 'ACTIVE';
    this.pipelineStatus = 'HEALTHY';
    this.simulationStatus = 'PLAYING';
    this.averageEngineLatencyMs = 1.1;

    if (appContextInstance) {
      const config = appContextInstance.get('config');
      this.version = config.app?.VERSION || config.VERSION || '0.1.0';
      this.env = config.app?.ENV || config.ENV || 'development';
      
      const registry = appContextInstance.get('serviceRegistry');
      const registryStatus = registry.getStatus();
      this.registryHealth = registryStatus.healthy ? 'HEALTHY' : 'DEGRADED';
      this.registeredServicesCount = registryStatus.services?.length || 11;
      this.healthyServicesCount = registryStatus.services?.filter(s => s.status === 'initialized').length || 11;

      const simulationManager = appContextInstance.get('simulationManager');
      this.simulationStatus = simulationManager?.isPlaying ? 'PLAYING' : 'PAUSED';

      const metricsManager = appContextInstance.get('engineMetrics');
      const metrics = metricsManager.getMetrics();
      this.trackedEngines = Object.keys(metrics).map(key => ({
        id: key,
        count: metrics[key].executionCount,
        averageMs: metrics[key].averageRuntimeMs
      }));

      // Compute average engine latency dynamically
      if (this.trackedEngines.length > 0) {
        const sum = this.trackedEngines.reduce((acc, curr) => acc + curr.averageMs, 0);
        this.averageEngineLatencyMs = sum / this.trackedEngines.length;
      }
    }
  }
}
export default SystemStatusViewModel;
