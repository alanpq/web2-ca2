import Vector from "./math/vector.mjs";
import * as input from "./input.mjs";
import { PHYSICS_INTER } from "./game.mjs";

export default class Player {
  #virtualPos = new Vector(); // virtual position for interpolation
  #position = new Vector();
  constructor () {

  }

  tick(dt) {
    this.#virtualPos = this.#position;
    this.#position.y += input.buttonDown("down") * PHYSICS_INTER * 10;
  }

  /**
   * Render the player.
   * @param {CanvasRenderingContext2D} ctx 2D Context
   * @param {number} dt Delta-time in seconds 
   */
  render(ctx, dt) {
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.#position, dt);
    ctx.fillRect(this.#virtualPos.x, this.#virtualPos.y, 5, 5);
  }
}