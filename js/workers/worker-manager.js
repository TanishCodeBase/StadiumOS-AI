import { logger } from '../diagnostics/logger.js';

class WorkerManager {
  constructor() {
    this.workerPath = './js/workers/sim.worker.js';
    this.worker = null;
    this.pendingTasks = new Map();
    this.taskIdCounter = 0;
    this.isSpawned = false;
    this.fallbackMode = false;
  }

  /**
   * Spawns the background Web Worker thread. Falls back if not supported.
   */
  spawn() {
    if (this.isSpawned) return;

    // Check if running in browser with Worker support
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(this.workerPath, { type: 'module' });
        
        this.worker.onmessage = (event) => {
          this._handleWorkerMessage(event.data);
        };

        this.worker.onerror = (err) => {
          logger.error('Worker', 'WorkerManager: Worker runtime error', err);
          this.recover();
        };

        this.isSpawned = true;
        this.fallbackMode = false;
        logger.info('Worker', 'WorkerManager: Web Worker spawned successfully.');
      } catch (err) {
        logger.warn('Worker', 'WorkerManager: Failed to spawn Web Worker. Activating fallback mode.', err);
        this.fallbackMode = true;
        this.isSpawned = true;
      }
    } else {
      logger.info('Worker', 'WorkerManager: Environment does not support Web Workers. Activating fallback mode.');
      this.fallbackMode = true;
      this.isSpawned = true;
    }
  }

  /**
   * Shuts down the active worker and rejects pending tasks.
   */
  terminate() {
    if (!this.isSpawned) return;

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Cancel all pending tasks
    for (const [taskId, { reject }] of this.pendingTasks.entries()) {
      reject(new Error(`Task ${taskId} cancelled due to worker termination`));
    }
    this.pendingTasks.clear();
    
    this.isSpawned = false;
    logger.info('Worker', 'WorkerManager: Web Worker terminated.');
  }

  /**
   * Restarts the worker
   */
  restart() {
    logger.info('Worker', 'WorkerManager: Restarting Worker...');
    this.terminate();
    this.spawn();
  }

  /**
   * Automatic recovery from worker failures
   */
  recover() {
    logger.warn('Worker', 'WorkerManager: Worker crash detected. Running recovery protocol.');
    this.restart();
  }

  /**
   * Queues a task for computational processing
   * @param {string} type task label
   * @param {any} payload task parameters
   * @returns {Promise<any>} resolves with computed result
   */
  queueTask(type, payload) {
    this.taskIdCounter++;
    const taskId = this.taskIdCounter;

    return new Promise((resolve, reject) => {
      this.pendingTasks.set(taskId, { resolve, reject });

      if (this.fallbackMode || !this.worker) {
        // Fallback synchronous/async execution
        setTimeout(() => this._executeFallback(taskId, type, payload), 0);
      } else {
        this.worker.postMessage({ taskId, type, payload });
      }
    });
  }

  /**
   * Cancels a queued task
   * @param {number} taskId 
   */
  cancelTask(taskId) {
    if (this.pendingTasks.has(taskId)) {
      const { reject } = this.pendingTasks.get(taskId);
      reject(new Error(`Task ${taskId} explicitly cancelled.`));
      this.pendingTasks.delete(taskId);
      logger.debug('Worker', `WorkerManager: Cancelled task ${taskId}`);
    }
  }

  /**
   * Return status info
   * @returns {object}
   */
  getStatus() {
    return {
      isSpawned: this.isSpawned,
      fallbackMode: this.fallbackMode,
      pendingTasksCount: this.pendingTasks.size
    };
  }

  /**
   * Internal message handler
   */
  _handleWorkerMessage(data) {
    const { taskId, success, payload, error } = data;
    
    if (!this.pendingTasks.has(taskId)) return;

    const { resolve, reject } = this.pendingTasks.get(taskId);
    this.pendingTasks.delete(taskId);

    if (success) {
      resolve(payload);
    } else {
      reject(new Error(error || 'Worker task execution failed'));
    }
  }

  /**
   * Internal mock fallback executor for testing/Node
   */
  _executeFallback(taskId, type, payload) {
    if (!this.pendingTasks.has(taskId)) return;

    const { resolve } = this.pendingTasks.get(taskId);
    this.pendingTasks.delete(taskId);

    // Simulate basic computation fallback
    if (type === 'PROCESS_FRAME') {
      // Fallback does a simple map update (identity or adding mock computations)
      const processedFrame = {
        ...payload,
        processedBy: 'InProcessFallback',
        metrics: {
          ...payload.metrics,
          fps: 60,
          performanceTickMs: 1 // mock
        }
      };
      resolve(processedFrame);
    } else {
      resolve(payload);
    }
  }
}

export const workerManager = new WorkerManager();
export default workerManager;
