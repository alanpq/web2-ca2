'use strict';
import Vector from "./math/vector.mjs";

export class Camera {
  position = new Vector();
  smoothing = 10;
  #virtualPos = new Vector();
  #offset = new Vector();
  constructor() {

  }

  tick(dt) {
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.position, dt * this.smoothing);
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  clearTransform(ctx) {
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  setTransform(ctx) {
    this.#offset.x = ctx.canvas.width/2;
    this.#offset.y = ctx.canvas.height/2;
    ctx.transform(1, 0, 0, 1, -this.#virtualPos.x + this.#offset.x, -this.#virtualPos.y + this.#offset.y);
  }

  screenToWorld(pos) {
    return new Vector(pos.x + this.#virtualPos.x - this.#offset.x, pos.y + this.#virtualPos.y - this.#offset.y);
  }
}