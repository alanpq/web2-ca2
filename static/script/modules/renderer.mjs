'use strict';
import UI from './ui/ui.mjs';
import * as input from './input/mod.mjs';
import { PHYSICS_INTER } from './constants.mjs';
import { Camera } from './camera.mjs';
import * as debug from './ui/debug.mjs';
export default class Renderer {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  #w;
  #h;
  get width() { return this.#w; }
  get height() { return this.#h; }

  camera;

  /** @type {UI} */
  #ui;

  // DT calculation
  #then;
  #time = 0; // time collector to be eaten by physics tick
  onDraw;
  onTick;
  onPhysics;
  onUI;
  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.#canvas = canvas;
    this.#w = canvas.width;
    this.#h = canvas.height;

    this.#ctx = canvas.getContext('2d');
    this.#ui = new UI(this.#ctx);

    this.camera = new Camera();

    window.addEventListener("resize", () => {
      this.conformToParent();
    });
    window.requestAnimationFrame(this.#loop.bind(this));
  }

  listen(draw, ui, tick, physics) {
    this.onDraw = draw;
    this.onUI = ui;
    this.onTick = tick;
    this.onPhysics = physics;
  }

  #loop(now) {
    if(!this.#then) {
      this.#then = now;
    }
    const dt = (now-this.#then)/1000;
    this.#time += dt;
    // has enough time passed for physics tick?
    if (this.#time > PHYSICS_INTER) {
      this.#time -= PHYSICS_INTER; // consume time taken by the tick
      if(this.onPhysics) this.onPhysics(PHYSICS_INTER);
    }
    this.#ctx.resetTransform();
    this.#ctx.fillStyle = "black";
    this.#ctx.fillRect(0,0, this.width, this.height);
    this.camera.setTransform(this.#ctx);
    if(this.onDraw) this.onDraw(dt, this.#ctx);
    debug.draw(dt, this.#ctx);
    
    this.#ctx.resetTransform();
    if(this.onUI) this.onUI(dt, this.#ui);
    debug.ui(dt, this.#ui);

    if(this.onTick) this.onTick(dt);
    debug.tick(dt);

    this.camera.tick(dt);
    input.tick();
    window.requestAnimationFrame(this.#loop.bind(this));
    this.#then = now;
  }
  
  conformToParent() {
    let h = this.#canvas.parentElement.clientHeight - 30;
    let w = h * 1.77777;
    const ww = window.innerWidth;
    const left = this.#canvas.offsetLeft;
    if(w > window.innerWidth - (left * 2) + 2) {
      w = this.#canvas.parentElement.clientWidth;
      h = w * 0.5625;
    }
    // TODO: this will not work if w < h
    this.setSize(w, h); // 16:9 ratio
  }

  setSize(width, height) {
    this.#w = width || this.#w;
    this.#h = height || this.#h;
    this.#canvas.width = this.#w;
    this.#canvas.height = this.#h;
  }
}