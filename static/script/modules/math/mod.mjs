'use strict';

import Vector from "./vector.mjs";

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

export const randRange = (min, max) => {
  return Math.floor(Math.random() * (max-min)) + min;
}

// pointOnSegment, orientation, and lineIntersect taken from https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
export const pointOnSegment = (p, a, b) => {
  return (p.x <= Math.max(a.x, b.x) && p.x >= Math.max(a.x, b.x) &&
     p.y <= Math.max(a.y, b.y) && p.y >= Math.min(a.y, b.y))
}

export const orientation = (a, b, c) => {
  const val = (b.y - a.y) * (c.x - b.x) 
              - (b.x - a.x) * (c.y - b.y);

  if(val == 0) return 0;
  return (val>0) ? 1 : 2;
}

/**
 * Whether the segment a1a2 intersects with b1b2.
 * @param {Vector} a1 
 * @param {Vector} a2 
 * @param {Vector} b1 
 * @param {Vector} b2 
 */
export const lineIntersect = (a1, a2, b1, b2) => {
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);
  if(o1 != o2 && o3 != o4) return true;
  if(o1 == 0 && pointOnSegment(a1, b1, a2)) return true;
  if(o2 == 0 && pointOnSegment(a1, b2, a2)) return true;
  if(o3 == 0 && pointOnSegment(b1, a1, b2)) return true;
  if(o4 == 0 && pointOnSegment(b1, a2, b2)) return true;
  return false;
}