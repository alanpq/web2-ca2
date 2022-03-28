import { lerp } from "./mod.mjs";

export default class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
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
    return Math.sqrt(this.sqrMagnitude());
  }

  get clone() {
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
  }
  /**
   * Returns a - b.
   * @param {Vector} a
   * @param {Vector} b
   */
  static add(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
  }

  /**
   * Scales every component of this vector with every component of the other vector.
   * @param {Vector} b The other vector.
   */
  scale(b) {
    this.x *= b.x;
    this.y *= b.y;
  }

  /**
   * Multiplies this vector by a scalar
   * @param {number} v Scalar to multiply.
   */
  mul(v) {
    this.x *= v;
    this.y *= v;
  }

}