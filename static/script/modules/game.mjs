import { FONTS, PHYSICS_INTER } from "./constants.mjs";
import Player from "./player.mjs";
import Renderer from "./renderer.mjs";

import * as input from './input/mod.mjs';

import { CHUNK_SIZE, TILE_SIZE, World } from "./world.mjs";
import { findPath, idxToPos } from "./ai/pathfinding.mjs";
import Vector from "./math/vector.mjs";


export default class Game {
  #loaded = false;
  /** @type {Renderer} */
  #renderer;

  #player;
  #world;

  get loaded() {
    return this.#loaded;
  }

  constructor(renderer) {
    this.#renderer = renderer;

    this.#player = new Player();
    this.#world = new World();


    this.#renderer.listen(
      (dt, ctx) => {this.draw(dt, ctx)},
      (dt) => {this.tick(dt)},
      (dt, ui) => {this.ui(dt, ui)},
    )
  }

  async load() {
    if(this.#loaded) return;
    console.debug("Loading game...");

    this.#loaded = true;
  }

  start() {
  }

  destroy() {
    if(!this.#loaded) return; // no need to unload anything if not loaded
    console.debug("Destroying game...");
  }

  ////// ACTUAL GAME STUFF

  /**
   * 
   * @param {number} dt Deltatime in seconds
   * @param {UI} ui UI Object
   */
  ui(dt, ui) { 
    ui.font.color = "white";
    ui.font.family = FONTS.MONO;
    ui.startVertical();
    ui.text(`frametime: ${(dt*1000).toFixed(3)}`);
    ui.text(`p: ${this.#player.position.toString()}`);
    ui.endVertical();
  }

  
  /** @type {import("./world.mjs").DetailedTile} */
  #a;
  /** @type {import("./world.mjs").DetailedTile} */
  #b;
  #path;
  /**
  * Render a frame.
  * @param {number} dt
  * @param {CanvasRenderingContext2D} ctx 
  */
  draw(dt, ctx) {
    this.#world.render(dt, ctx);
    
    this.#a = this.#world.probeTileFromWorld(this.#player.position);
    if(this.#a) {
      ctx.fillStyle = "rgba(255,0,0,0.2)";
      ctx.fillRect(this.#a.worldX*TILE_SIZE, this.#a.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    this.#b = this.#world.probeTileFromWorld(this.#renderer.camera.screenToWorld(input.mouse()))
    if(this.#b) {
      ctx.fillStyle = "rgba(0,0,255,0.2)";
      ctx.fillRect(this.#b.worldX*TILE_SIZE, this.#b.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    if(input.leftMouseDown()) {
      this.#path = findPath(this.#world, this.#a, this.#b);
      console.debug(this.#path);
    }

    if(this.#path) {
      for(let i = this.#path.length-1; i >= 1; i--) {
        ctx.strokeStyle = "green";
        ctx.beginPath();
        const off = new Vector(this.#a.chunk.x + 0.5, this.#a.chunk.y + 0.5);
        const aa = idxToPos(this.#path[i]).add(off).mul(TILE_SIZE);
        const bb = idxToPos(this.#path[i-1]).add(off).mul(TILE_SIZE);
        ctx.moveTo(aa.x, aa.y);
        ctx.lineTo(bb.x, bb.y);
        ctx.stroke();
      }
    }
    
    this.#player
      .render(dt, ctx);
  }

  /**
   * Do a physics tick.
   */
  tick(dt) {
    this.#player.tick(PHYSICS_INTER);
    this.#renderer.camera.position = this.#player.position;
  }
}