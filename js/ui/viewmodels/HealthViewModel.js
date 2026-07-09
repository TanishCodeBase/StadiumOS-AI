export class HealthViewModel {
  constructor(latestDecisionFrame, storeState) {
    const latestFrame = storeState?.simulation?.latestFrame || null;
    
    this.pipelineLatencyMs = latestDecisionFrame?.metrics?.executionTimeMs || 0.0;
    this.workerStatus = latestFrame?.metrics?.workerStatus || 'HEALTHY';
    this.workerLatencyMs = latestFrame?.metrics?.workerLatencyMs || 1.2;
    this.simulationState = storeState?.simulation?.isPlaying ? 'PLAYING' : 'PAUSED';
    
    this.frameRate = 60;
    this.memoryUsedVal = 42; 
    this.memoryUsed = '42.5 MB';
    this.frameProcessingTimeMs = this.workerLatencyMs;
    this.latencyHistory = [0.8, 1.2, 0.9, 1.5, 1.1, 0.9, 1.2, 0.9];
    this.engineHealth = this.workerStatus === 'FAULTED' || this.workerStatus === 'RESTARTING' ? 'DEGRADED' : 'EXCELLENT';
  }
}
export default HealthViewModel;
