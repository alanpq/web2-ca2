'use strict';
import { lerp } from "./mod.mjs";

export default class Vector {
  x;
  y;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  toString(fixed=20) {
    return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
  }

  static zero = new Vector();
  static up = new Vector(0,1);
  static down = new Vector(0,-1);
  static left = new Vector(-1,0);
  static right = new Vector(1,0);
  static one = new Vector(1,1);

  // TODO: random unit vector
  /**
   * Random vector uniformly distributed within a square
   * @returns {Vector}
   */
  static random() {
    return new Vector(Math.random()*2-1, Math.random()*2-1);
  }

  /** Get the square magnitude of the vector.
   * @returns {number}
   */
  get sqrMagnitude() {
    return this.x * this.x + this.y * this.y;
  }
  /** Get the magnitude of the vector.
   * @returns {number}
   */
  get magnitude() {
    return Math.sqrt(this.sqrMagnitude);
  }

  normalized() {
    const m = this.magnitude || 1;
    return new Vector(this.x/m, this.y/m);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  /**
   * Linearly interpolate between a and b.
   * @param {Vector} a
   * @param {Vector} b 
   * @param {number} t Amount to interpolate [0-1] 
   */
  static lerp(a, b, t) {
    return new Vector(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
  }

  /**
   * Add another vector to this vector. Mutates the current vector.
   * @param {Vector} b The other vector.
   */
  add(b) {
    this.x += b.x;
    this.y += b.y;
    return this;
  }

  /**
   * Returns the sum of all vectors provided.
   * @param {Vector} a
   * @param {Vector} b
   */
  static add(a, b) {
    const v = new Vector(a.x + b.x, a.y + b.y);
    const args = arguments;
    for(let i = 2; i < args.length; i++) {
      v.add(args[i]);
    }
    return v;
  }

  /**
   * Subtract another vector from this vector. Mutates the current vector.
   * @param {Vector} b The other vector.
   */
  sub(b) {
    this.x -= b.x;
    this.y -= b.y;
    return this;
  }
  /**
   * Returns a - b.
   * @param {Vector} a
   * @param {Vector} b
   */
  static sub(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
  }

  /**
   * Scales every component of this vector with every component of the other vector.
   * @param {Vector} b The other vector.
   */
  scale(b) {
    this.x *= b.x;
    this.y *= b.y;
    return this;
  }

  /**
   * Multiplies this vector by a scalar
   * @param {number} v Scalar to multiply.
   */
  mul(v) {
    this.x *= v;
    this.y *= v;
    return this;
  }
  /**
   * Returns v * n
   * @param {Vector} v Vector to multiply.
   * @param {number} n Scalar to multiply.
   */
   static mul(v, n) {
    return new Vector(v.x*n, v.y*n);
  }

  /**
   * Divides this vector by a scalar
   * @param {number} v Scalar to divide.
   */
   div(v) {
    this.x /= v;
    this.y /= v;
    return this;
  }

  /**
   * Dot product of a and b.
   * @param {Vector} a 
   * @param {Vector} b 
   */
  static dot(a,b) {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Project vector a onto vector b.
   * @param {Vector} a Vector to project.
   * @param {Vector} b Unit vector to project onto.
   */
  static project(a, b) {
    const dot = Vector.dot(a,b);
    return new Vector(dot * b.x, dot * b.y);
  }

}