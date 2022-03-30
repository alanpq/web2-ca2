import Entity from "../../entity.mjs";
import Vector from "../../math/vector.mjs";

export default class Dummy extends Entity {
  constructor (world, position) {
    super(world, position, new Vector(10, 10));
    this.speed = 0;
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   */
  physics(dt) {

  }
  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "grey";
    super.render(dt, ctx);
  }
}