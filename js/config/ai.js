export const aiConfig = {
  PIPELINE_INTERVAL_MS: 1000,
  DEFAULT_ACCURACY_THRESHOLD: 0.90,
  ENGINES: {
    CROWD: { priority: 1, version: '1.0.0' },
    THREAT: { priority: 2, version: '1.0.0' },
    ROUTING: { priority: 3, version: '1.0.0' }
  }
};
export default aiConfig;
