export class GeometryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const geometryCache = new GeometryCache();
export default geometryCache;
