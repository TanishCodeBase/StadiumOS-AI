import { SCHEMA } from './schema.js';

export class BaseModel {
  constructor(schemaKey) {
    this.schemaVersion = SCHEMA[schemaKey] || 1;
  }

  /**
   * Abstract validation method. Subclasses must override to perform specific checks.
   * @returns {boolean}
   */
  validate() {
    return true;
  }

  /**
   * Returns a shallow copy cloned instance of the model
   * @returns {BaseModel}
   */
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    
    // Copy all properties
    Object.getOwnPropertyNames(this).forEach(prop => {
      const val = this[prop];
      if (Array.isArray(val)) {
        cloned[prop] = [...val];
      } else if (val !== null && typeof val === 'object' && !(val instanceof BaseModel)) {
        cloned[prop] = { ...val };
      } else {
        cloned[prop] = val;
      }
    });

    return cloned;
  }

  /**
   * Recursively freezes the instance to guarantee deep immutability
   * @returns {BaseModel}
   */
  freeze() {
    const deepFreeze = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        const val = obj[prop];
        if (val && typeof val === 'object') {
          deepFreeze(val);
        }
      });
      return obj;
    };
    return deepFreeze(this);
  }

  /**
   * Formats the model properties into a clean JSON-serializable object
   * @returns {object}
   */
  toJSON() {
    const obj = {};
    Object.getOwnPropertyNames(this).forEach(prop => {
      const val = this[prop];
      if (val && typeof val.toJSON === 'function') {
        obj[prop] = val.toJSON();
      } else if (Array.isArray(val)) {
        obj[prop] = val.map(item => item && typeof item.toJSON === 'function' ? item.toJSON() : item);
      } else {
        obj[prop] = val;
      }
    });
    return obj;
  }

  /**
   * Performs comparison of fields to check equivalence
   * @param {BaseModel} other 
   * @returns {boolean}
   */
  equals(other) {
    if (!other || Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
      return false;
    }
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  /**
   * Returns a merged duplicate instance of the model with partial updates
   * @param {object} partial 
   * @returns {BaseModel}
   */
  merge(partial) {
    const nextInstance = Object.create(Object.getPrototypeOf(this));
    Object.assign(nextInstance, this);
    
    if (partial) {
      Object.getOwnPropertyNames(partial).forEach(prop => {
        nextInstance[prop] = partial[prop];
      });
    }

    return nextInstance;
  }

  static from(raw) {
    throw new Error('static from(raw) must be implemented by BaseModel subclasses.');
  }
}
export default BaseModel;
