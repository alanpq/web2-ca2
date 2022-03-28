import Vector from "./math/vector.mjs";
import * as input from "./input/mod.mjs";
import { PHYSICS_INTER } from "./constants.mjs";

export default class Player {
  #virtualPos = new Vector(); // virtual position for interpolation
  #position = new Vector();
  constructor () {

  }

  get position (){return this.#position;}

  tick(dt) {
    this.#position.x += input.axis("horizontal") * PHYSICS_INTER * 100;
    this.#position.y -= input.axis("vertical") * PHYSICS_INTER * 100;
  }

  /**
   * Render the player.
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle="white";
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.#position, 0.4);
    ctx.fillRect(this.#virtualPos.x, this.#virtualPos.y, 5, 5);
  }
}