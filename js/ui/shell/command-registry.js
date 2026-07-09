import { BaseManager } from '../../core/base-manager.js';
import { EVENTS } from '../../core/events.js';
import { logger } from '../../diagnostics/logger.js';

class CommandRegistry extends BaseManager {
  constructor() {
    super('1.0.0');
    this.commands = new Map();
    this.context = null;
    this.eventBus = null;
  }

  /**
   * Initializes CommandRegistry with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;
    this.eventBus = context.get('eventBus');
  }

  register(cmd) {
    if (!cmd || !cmd.id || typeof cmd.execute !== 'function') {
      logger.error('System', 'CommandRegistry: Registration failed, missing command properties.');
      return;
    }

    const command = {
      id: cmd.id,
      title: cmd.title || cmd.id,
      description: cmd.description || '',
      category: cmd.category || 'General',
      shortcut: cmd.shortcut || '',
      icon: cmd.icon || '🛠️',
      enabled: cmd.enabled !== undefined ? !!cmd.enabled : true,
      execute: cmd.execute
    };

    this.commands.set(cmd.id, command);
    if (this.eventBus) {
      this.eventBus.publish(EVENTS.COMMANDS.COMMAND_REGISTERED, command);
    }
    logger.debug('System', `CommandRegistry: Successfully registered command '${cmd.id}'`);
  }

  unregister(id) {
    if (this.commands.has(id)) {
      this.commands.delete(id);
      logger.debug('System', `CommandRegistry: Unregistered command '${id}'`);
    }
  }

  get(id) {
    return this.commands.get(id);
  }

  getAll() {
    return Array.from(this.commands.values());
  }

  clear() {
    this.commands.clear();
    logger.debug('System', 'CommandRegistry: Registry cleared');
  }

  dispose() {
    this.clear();
    this.context = null;
    this.eventBus = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      registeredCommandsCount: this.commands.size,
      categoriesList: Array.from(new Set(this.getAll().map(c => c.category)))
    };
  }
}

export const commandRegistry = new CommandRegistry();
export default commandRegistry;
