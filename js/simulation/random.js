/**
 * StadiumOS AI - Deterministic Seeded Random Number Generator (Mulberry32)
 */

/**
 * Creates a Mulberry32 generator function.
 * @param {number} seed 
 * @returns {Function} a generator function that returns values between 0 and 1
 */
export function createPRNG(seed) {
  let state = seed;
  return function() {
    let t = state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
