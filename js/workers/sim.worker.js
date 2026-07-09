/**
 * StadiumOS AI - Simulation Web Worker Thread
 * Performs compute-heavy simulation frame processing to keep UI thread responsive
 */

self.onmessage = function(event) {
  const { taskId, type, payload } = event.data;

  if (type === 'PROCESS_FRAME') {
    const startTime = performance.now();
    
    // Simulate mathematical density processing (e.g. path planning loops)
    let mathAccumulator = 0;
    for (let i = 0; i < 100000; i++) {
      mathAccumulator += Math.sin(i) * Math.cos(i);
    }

    const duration = performance.now() - startTime;
    
    // Add processed metadata and worker performance metrics
    const processedFrame = {
      ...payload,
      processedBy: 'WebWorkerThread',
      metrics: {
        ...payload.metrics,
        workerDurationMs: duration,
        mathCheck: mathAccumulator
      }
    };

    self.postMessage({
      taskId,
      success: true,
      payload: processedFrame
    });
  } else {
    self.postMessage({
      taskId,
      success: false,
      error: `Unknown task type '${type}'`
    });
  }
};
