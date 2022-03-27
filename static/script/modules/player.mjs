import Vector from "./math/vector.mjs";
import * as input from "./input.mjs";
import { PHYSICS_INTER } from "./game.mjs";

export default class Player {
  #prevPos = new Vector(); // previous position for interpolation
  #position = new Vector();
  constructor () {

  }

  tick(dt) {
    this.#position.y += input.buttonDown("down") * PHYSICS_INTER * 10;
  }

  /**
   * Render the player.
   * @param {CanvasRenderingContext2D} ctx 2D Context
   * @param {number} dt Delta-time in seconds 
   */
  render(ctx, dt) {
    ctx.fillRect(this.#position.x, this.#position.y, 5, 5);
  }
}