/**
 * StadiumOS AI - Serialization layer
 * Centralized serializer, cloner, deep-freezer, and deserializer with schema mapping hooks.
 */

/**
 * Standard serialization to JSON string. Calls toJSON() on BaseModel instances automatically.
 * @param {any} obj 
 * @returns {string}
 */
export function serialize(obj) {
  if (obj && typeof obj.toJSON === 'function') {
    return JSON.stringify(obj.toJSON());
  }
  return JSON.stringify(obj);
}

/**
 * Deserializes JSON string to objects or concrete domain class instances.
 * @param {string|object} json 
 * @param {Function} [classType] Class containing static from(raw)
 * @returns {any}
 */
export function deserialize(json, classType) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  if (classType && typeof classType.from === 'function') {
    return classType.from(parsed);
  }
  return parsed;
}

/**
 * Recursively deep freezes an object/array to enforce absolute immutability.
 * @param {any} obj 
 * @returns {any}
 */
export function deepFreeze(obj) {
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

/**
 * Returns a cloned copy of the object or class instance.
 * @param {any} obj 
 * @returns {any}
 */
export function clone(obj) {
  if (obj && typeof obj.clone === 'function') {
    return obj.clone();
  }
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}
