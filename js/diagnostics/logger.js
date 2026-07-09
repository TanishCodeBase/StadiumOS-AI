import { CONFIG } from '../config.js';

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CATEGORIES = new Set([
  'System',
  'Store',
  'EventBus',
  'UI',
  'Simulation',
  'AI',
  'Worker',
  'Performance',
  'Security'
]);

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.filters = {
      category: null,
      level: CONFIG.LOG_LEVEL || 'DEBUG',
      startTimestamp: null,
    };
  }

  setFilters(filters = {}) {
    this.filters = { ...this.filters, ...filters };
  }

  _log(level, category, message, ...args) {
    // Validate category
    if (!CATEGORIES.has(category)) {
      console.warn(`[Logger] Warning: Unknown category '${category}' used for log message.`);
    }

    const configLevel = this.filters.level;
    if (LEVELS[level] < LEVELS[configLevel]) return;

    if (this.filters.category && this.filters.category !== category) return;

    const timestamp = new Date().toISOString();
    if (this.filters.startTimestamp && new Date(timestamp) < new Date(this.filters.startTimestamp)) return;

    const formattedMessage = `[${timestamp}] [${level}] [${category}] ${message}`;
    
    // Add to internal history
    this.logs.push({ timestamp, level, category, message, args });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Styles for console output
    const styles = {
      DEBUG: 'color: #3b82f6; font-weight: 500;', // blue
      INFO: 'color: #10b981; font-weight: 500;',  // green
      WARN: 'color: #f59e0b; font-weight: 600;',  // yellow
      ERROR: 'color: #ef4444; font-weight: bold;', // red
    };

    console.log(`%c${formattedMessage}`, styles[level] || '', ...args);
  }

  debug(category, message, ...args) { this._log('DEBUG', category, message, ...args); }
  info(category, message, ...args) { this._log('INFO', category, message, ...args); }
  warn(category, message, ...args) { this._log('WARN', category, message, ...args); }
  error(category, message, ...args) { this._log('ERROR', category, message, ...args); }

  getHistory() {
    return [...this.logs];
  }

  clearHistory() {
    this.logs = [];
  }
}

export const logger = new Logger();
