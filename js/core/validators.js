import { CONFIG } from '../config/index.js';
import { ThreatLevel } from '../models/enums/ThreatLevel.js';
import { IncidentSeverity } from '../models/enums/IncidentSeverity.js';
import { logger } from '../diagnostics/logger.js';

export function isNumber(val) {
  return typeof val === 'number' && !isNaN(val);
}

export function isCoordinate(val) {
  return typeof val === 'object' && val !== null && isNumber(val.x) && isNumber(val.y);
}

export function isSeverity(val) {
  return Object.values(IncidentSeverity).includes(val);
}

export function isThreatLevel(val) {
  return Object.values(ThreatLevel).includes(val);
}

export function isTimestamp(val) {
  return isNumber(val) && val >= 0;
}

export function isUUID(val) {
  if (typeof val !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(val);
}

export function validateDecision(decision) {
  if (!decision) return false;
  if (typeof decision.validate === 'function') {
    return decision.validate();
  }
  return typeof decision.id === 'string' && typeof decision.conclusion === 'string';
}

export function validateRecommendation(recommendation) {
  if (!recommendation) return false;
  if (typeof recommendation.validate === 'function') {
    return recommendation.validate();
  }
  return typeof recommendation.id === 'string' && typeof recommendation.action === 'string';
}

export function validateFrame(frame) {
  if (!frame) return false;
  if (typeof frame.validate === 'function') {
    return frame.validate();
  }
  return isTimestamp(frame.timestamp);
}

/**
 * Validates payload contracts before publishing events.
 * Returns true if valid. Throws error in dev, logs warning in prod if invalid.
 * @param {string} event 
 * @param {any} data 
 * @returns {boolean}
 */
export function assertPayload(event, data) {
  const isProd = CONFIG.app?.ENV === 'production' || CONFIG.ENV === 'production';
  let valid = true;
  let reason = '';

  if (event === 'SIMULATION_FRAME') {
    valid = validateFrame(data);
    reason = 'Invalid Simulation Frame schema structure';
  } else if (event === 'AI_DECISION_FRAME') {
    valid = data && isTimestamp(data.timestamp) && isThreatLevel(data.threatLevel);
    reason = 'Invalid Decision Frame schema structure';
  } else if (event === 'INCIDENT_CREATED') {
    valid = data && typeof data.id === 'string' && typeof data.type === 'string';
    reason = 'Invalid Incident structure';
  } else if (event === 'ACTION_EXECUTED') {
    valid = data && typeof data.decisionId === 'string';
    reason = 'Invalid Action structure';
  } else if (event === 'THEME_CHANGED') {
    valid = typeof data === 'string';
    reason = 'Invalid Theme state payload';
  } else if (event === 'WORKER_STARTED') {
    valid = data && typeof data.workerId === 'string';
    reason = 'Invalid Worker identity details';
  }

  if (!valid) {
    logger.error('System', `Event validation error for '${event}': ${reason}`);
    if (!isProd) {
      throw new Error(`[Assertion Error] Event '${event}' validation failed: ${reason}`);
    }
  }

  return valid;
}
