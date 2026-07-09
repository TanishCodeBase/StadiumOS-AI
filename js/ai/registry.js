import { logger } from '../diagnostics/logger.js';

class AiRegistry {
  constructor() {
    this.engines = new Map();
  }

  /**
   * Registers a new AI engine instance
   * @param {string} id engine ID
   * @param {BaseEngine} engine engine instance
   */
  register(id, engine) {
    if (!id || typeof id !== 'string') {
      logger.error('AI', 'AiRegistry: Registration failed, invalid id provided.');
      return;
    }

    if (!engine || typeof engine.analyze !== 'function') {
      logger.error('AI', `AiRegistry: Registration failed for '${id}', engine must inherit BaseEngine.`);
      return;
    }

    // Capture metadata properties from the engine instance
    const meta = {
      id: engine.id || id,
      name: engine.name || 'Unnamed Engine',
      version: engine.version || '1.0.0',
      description: engine.description || '',
      priority: typeof engine.priority === 'number' ? engine.priority : 99
    };

    // Attach metadata configurations to instance
    engine.metadata = meta;

    this.engines.set(id, engine);
    logger.info('AI', `AiRegistry: Successfully registered engine '${id}' ("${meta.name}") with priority ${meta.priority}`);
  }

  /**
   * Unregisters an AI engine
   * @param {string} id 
   */
  unregister(id) {
    if (this.engines.has(id)) {
      this.engines.delete(id);
      logger.info('AI', `AiRegistry: Unregistered engine '${id}'`);
    }
  }

  has(id) {
    return this.engines.has(id);
  }

  get(id) {
    return this.engines.get(id);
  }

  /**
   * Returns all registered engines sorted by priority (lowest priority first)
   * @returns {Array<BaseEngine>}
   */
  getAll() {
    return Array.from(this.engines.values())
      .sort((a, b) => {
        const priorityA = a.metadata?.priority || 99;
        const priorityB = b.metadata?.priority || 99;
        return priorityA - priorityB;
      });
  }

  clear() {
    this.engines.clear();
    logger.debug('AI', 'AiRegistry: Registry cleared');
  }
}

export const aiRegistry = new AiRegistry();
export default aiRegistry;
