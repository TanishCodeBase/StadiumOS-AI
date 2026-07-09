/**
 * StadiumOS AI - Rolling History
 * Generic circular buffer / capped list for metrics, events, and performance tracking
 */
export class RollingHistory {
  /**
   * @param {number} capacity max size of the rolling log
   */
  constructor(capacity = 100) {
    this._capacity = Math.max(1, capacity);
    this.buffer = [];
  }

  /**
   * Pushes a new item into history. Shifts out oldest if over capacity.
   * @param {any} item 
   */
  push(item) {
    this.buffer.push(item);
    if (this.buffer.length > this._capacity) {
      this.buffer.shift();
    }
  }

  /**
   * Clears the history buffer
   */
  clear() {
    this.buffer = [];
  }

  /**
   * Returns current count of stored items
   * @returns {number}
   */
  size() {
    return this.buffer.length;
  }

  /**
   * Returns maximum capacity of history buffer
   * @returns {number}
   */
  capacity() {
    return this._capacity;
  }

  /**
   * Returns a copy of the buffer as an array (oldest to newest)
   * @returns {Array<any>}
   */
  toArray() {
    return [...this.buffer];
  }

  /**
   * Returns latest pushed item
   * @returns {any|undefined}
   */
  latest() {
    if (this.buffer.length === 0) return undefined;
    return this.buffer[this.buffer.length - 1];
  }

  /**
   * Calculates mathematical average of values resolved by selector
   * @param {Function} selector mapping function (item) => number
   * @returns {number}
   */
  average(selector) {
    if (this.buffer.length === 0) return 0;
    
    const resolve = typeof selector === 'function' ? selector : (val => val);
    
    let sum = 0;
    let count = 0;
    
    this.buffer.forEach(item => {
      const val = resolve(item);
      if (typeof val === 'number' && !isNaN(val)) {
        sum += val;
        count++;
      }
    });

    return count > 0 ? parseFloat((sum / count).toFixed(3)) : 0;
  }
}
export default RollingHistory;
