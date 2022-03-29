'use strict';
/**
 * Interpolate between a and b. NOTE: at t=1, floating point error will make the result != b.
 * @param {number} a
 * @param {number} b 
 * @param {number} t Amount to interpolate [0-1]
 */
export const lerp = (a,b,t) => {
  // formula taken from https://en.wikipedia.org/wiki/Linear_interpolation
  return a + t*(b-a);
}