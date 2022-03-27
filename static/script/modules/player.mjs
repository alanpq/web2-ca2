import Vector from "./math/vector.mjs";

export default class Player {
  #position = new Vector();
  constructor () {

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