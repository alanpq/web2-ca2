import Player from "./player.mjs";
import { addEventListener } from "./spa.mjs";

export default class Game {
  #loaded = false;
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  #player = new Player();

  // DT calculation
  #then;

  get loaded() {
    return this.#loaded;
  }

  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d');
  }

  async load() {
    if(this.#loaded) return;
    console.debug("Loading game...");

    this.#loaded = true;
  }

  start() {
    window.requestAnimationFrame(this.#render.bind(this));
  }

  destroy() {
    if(!this.#loaded) return; // no need to unload anything if not loaded
    console.debug("Destroying game...");
  }

  ////// ACTUAL GAME STUFF

  /**
   * Render a frame.
   * @param {DOMHighResTimeStamp} now 
   */
  #render(now) {
    if(!this.#then) {
      this.#then = now;
    }
    const dt = (now-this.#then)/1000;
    this.#ctx.fillStyle = "black";
    this.#ctx.fillRect(0,0, this.#canvas.width, this.#canvas.height);

    this.#ctx.fillStyle = "white";

    this.#ctx.fillText(`frametime: ${(dt*1000).toFixed(3)}`, 0, 10);
    // this.#player.render(this.#ctx, dt);

    this.#then = now;
    window.requestAnimationFrame(this.#render.bind(this));
  }

  /**
   * Do a physics tick.
   */
  #tick() {
  }
}