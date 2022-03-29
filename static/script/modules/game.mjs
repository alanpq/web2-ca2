import { FONTS, PHYSICS_INTER } from "./constants.mjs";
import Player from "./player.mjs";
import Renderer from "./renderer.mjs";

import * as input from './input/mod.mjs';

import { CHUNK_AREA, CHUNK_SIZE, TILES, TILE_SIZE, World } from "./world.mjs";
import { debug, findPath, idxToPos } from "./ai/pathfinding.mjs";
import Vector from "./math/vector.mjs";
import UI from './ui/ui.mjs';
import Rect from "./math/rect.mjs";

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
    this.#player.position.x = this.#player.position.y = CHUNK_SIZE*TILE_SIZE/2;
    this.#renderer.camera.position = this.#player.position;
    this.#world = new World();


    this.#renderer.listen(
      (dt, ctx) => {this.draw(dt, ctx)},
      (dt, ui) => {this.ui(dt, ui)},
      (dt) => {this.tick(dt)},
      (dt) => {this.physics(dt)},
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

  #debug = false;
  /**
   * 
   * @param {number} dt Deltatime in seconds
   * @param {UI} ui UI Object
   */
  ui(dt, ui) { 
    ui.font.color = "white";
    ui.font.family = FONTS.MONO;
    ui.startArea(new Rect(
      50, 50, 50, 50,
    ));
    ui.startVertical();
    ui.text(`frametime: ${(dt*1000).toFixed(3)}`);
    ui.text(`p: ${this.#player.position.toString()}`);
    this.#debug = ui.checkbox(this.#debug, "pathfinding debug mode");
    ui.endVertical();
    ui.endArea();
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

    if(this.#path) {
      const off = new Vector(this.#a.chunk.x + 0.5, this.#a.chunk.y + 0.5);
      const half_tile = TILE_SIZE/2;
      Object.entries(debug.order).forEach(([k,v]) => {
        const aa = idxToPos(k).mul(TILE_SIZE);
        const bb = idxToPos(v).mul(TILE_SIZE);
        ctx.fillStyle = `rgba(255, ${Math.floor((1 - (v / debug.i))*255)}, 0, .2)`; // 0 - 140
        ctx.fillRect(aa.x, aa.y, TILE_SIZE, TILE_SIZE);
      });
      Object.entries(debug.gScore).forEach(([k,v]) => {
        const aa = idxToPos(k).mul(TILE_SIZE);
        ctx.font = "10px monospace";
        ctx.fillStyle = "black"; // 0 - 140
        ctx.fillText(v, aa.x, aa.y+10);
      });
      Object.entries(debug.fScore).forEach(([k,v]) => {
        const aa = idxToPos(k).mul(TILE_SIZE);
        ctx.font = "10px monospace";
        ctx.fillStyle = "gray"; // 0 - 140
        const metrics = ctx.measureText(v);
        ctx.fillText(v, aa.x, aa.y+TILE_SIZE-2);
      });
      Object.entries(debug.cameFrom).forEach(([k, v]) => {
        if(v == null) return;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        const aa = idxToPos(k).add(off).mul(TILE_SIZE);
        const bb = idxToPos(v).add(off).mul(TILE_SIZE);
        ctx.moveTo(aa.x, aa.y);
        ctx.lineTo(bb.x, bb.y);
        ctx.stroke();
      });
      for(let i = this.#path.length-1; i >= 1; i--) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "green";
        ctx.beginPath();
        const aa = idxToPos(this.#path[i]).add(off).mul(TILE_SIZE);
        const bb = idxToPos(this.#path[i-1]).add(off).mul(TILE_SIZE);
        ctx.moveTo(aa.x, aa.y);
        ctx.lineTo(bb.x, bb.y);
        ctx.stroke();
      }
    }
    if(this.#a) {
      ctx.fillStyle = "rgba(255,0,0,0.2)";
      ctx.fillRect(this.#a.worldX*TILE_SIZE, this.#a.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    if(this.#b && !input.isMouseEaten()) {
      ctx.fillStyle = "rgba(0,0,255,0.2)";
      ctx.fillRect(this.#b.worldX*TILE_SIZE, this.#b.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    
    this.#player
      .render(dt, ctx);
  }

  /**
   * Do a tick.
   */
  tick(dt) {
    this.#a = this.#world.probeTileFromWorld(this.#player.position);
    this.#b = this.#world.probeTileFromWorld(this.#renderer.camera.screenToWorld(input.mouse()))
    if(input.leftMouseDown()) {
      this.#path = findPath(this.#world, this.#a, this.#b);
    }

    this.#renderer.camera.position = this.#player.position;
  }
  /**
   * Do a fixed rate physics tick.
   */
  physics(dt) {
    this.#player.tick(dt);
  }
}