import Player from "./player.mjs";
import Renderer from "./renderer.mjs";
import { addEventListener } from "./spa.mjs";

export default class Game {
  #loaded = false;
  /** @type {Renderer} */
  #renderer;

  #player = new Player();

  // DT calculation
  #then;

  get loaded() {
    return this.#loaded;
  }

  constructor(renderer) {
    this.#renderer = renderer;
  }

  async load() {
    if(this.#loaded) return;
    console.debug("Loading game...");

    this.#loaded = true;
  }

  start() {
    window.requestAnimationFrame(this.#draw.bind(this));
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
  #draw(now) {
    if(!this.#then) {
      this.#then = now;
    }
    const dt = (now-this.#then)/1000;
    const ctx = this.#renderer.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, this.#renderer.w, this.#renderer.h);

    ctx.fillStyle = "white";

    ctx.fillText(`frametime: ${(dt*1000).toFixed(3)}`, 0, 10);
    // this.#player.render(ctx, dt);

    this.#then = now;
    window.requestAnimationFrame(this.#draw.bind(this));
  }

  /**
   * Do a physics tick.
   */
  #tick() {
  }
}