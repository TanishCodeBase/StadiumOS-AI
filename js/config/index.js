import app from './app.js';
import simulation from './simulation.js';
import ai from './ai.js';
import ui from './ui.js';
import workers from './workers.js';
import diagnostics from './diagnostics.js';

export const CONFIG = {
  // Backward compatibility mappings
  APP_NAME: app.APP_NAME,
  VERSION: app.VERSION,
  ENV: app.ENV,
  LOG_LEVEL: diagnostics.LOG_LEVEL,
  SIMULATION: simulation,
  THEME: {
    DEFAULT: ui.DEFAULT_THEME,
    GRID_ROWS: ui.GRID_ROWS,
    GRID_COLS: ui.GRID_COLS
  },

  // Structured domains config
  app,
  simulation,
  ai,
  ui,
  workers,
  diagnostics
};

// Deep freeze helper to guarantee immutability
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const val = obj[prop];
    if (val && typeof val === 'object') {
      deepFreeze(val);
    }
  });
  return obj;
}

deepFreeze(CONFIG);
export default CONFIG;
