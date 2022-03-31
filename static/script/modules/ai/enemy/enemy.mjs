import Entity from "../../entity.mjs";
import Vector from "../../math/vector.mjs";
import World from "../../world.mjs";

export default class Enemy extends Entity {
  constructor (world, position) {
    super(world, position, new Vector(10, 10));
    this.speed = 105;
  }

  #targetTile;
  #path;

  tick(dt) {
    
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt, world) {
    super.physics(dt, world);
  }
  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "black";
    super.render(dt, ctx);
  }
}