/**
 * StadiumOS AI - ID Generation Utility
 * Centralizes identifier generation across all domains and managers.
 */

/**
 * Generates a RFC4122 compliant UUID v4 string.
 * @returns {string}
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Standardizes decision identifiers.
 * @param {string} engineId 
 * @param {number} tick 
 * @param {number} index 
 * @returns {string}
 */
export function decisionId(engineId, tick, index = 0) {
  return `DEC-${engineId}-${tick}-${index}`;
}

let incidentCounter = 0;
/**
 * Standardizes incident identifiers.
 * @returns {string}
 */
export function incidentId() {
  incidentCounter++;
  return `INC-${incidentCounter}-${Date.now()}`;
}

let workerCounter = 0;
/**
 * Standardizes web worker identifiers.
 * @returns {string}
 */
export function workerId() {
  workerCounter++;
  return `WORKER-${workerCounter}`;
}

let notificationCounter = 0;
/**
 * Standardizes notification message identifiers.
 * @returns {string}
 */
export function notificationId() {
  notificationCounter++;
  return `NOTIF-${notificationCounter}`;
}
