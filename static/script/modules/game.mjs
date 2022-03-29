import { FONTS, PHYSICS_INTER } from "./constants.mjs";
import Player from "./player.mjs";
import Renderer from "./renderer.mjs";

import * as input from './input/mod.mjs';

import { CHUNK_AREA, CHUNK_SIZE, TILES, TILE_SIZE, World } from "./world.mjs";
import { debug, findPath, idxToPos } from "./ai/pathfinding.mjs";
import Vector from "./math/vector.mjs";
import UI from './ui/mod.mjs';

const horizontals = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

const diagonals = [
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
];

const neighborsOf = (tile,c) => {
  if(tile < 0 || tile >= CHUNK_AREA) return;
  // FIXME: implement
  const lst = [];
  const t = idxToPos(tile);
  horizontals.forEach(([xo, yo]) => {
    const n = xo + yo * CHUNK_SIZE;
    const x = t.x + xo;
    const y = t.y + yo;
    if(x < 0 || x >= CHUNK_SIZE) return;
    if(y < 0 || y >= CHUNK_SIZE) return;
    if(c.getTile(x, y) == TILES.WALL) return;
    lst.push(tile+n);
  });
  // diagonals.forEach(([xo, yo]) => {
  //   const n = xo + yo * CHUNK_SIZE;
  //   const x = t.x + xo;
  //   const y = t.y + yo;
  //   if(x < 0 || x >= CHUNK_SIZE) return;
  //   if(y < 0 || y >= CHUNK_SIZE) return;
  //   if(c.getTile(x, y) == TILES.WALL) return;
  //   if(c.getTile(x, t.y) == TILES.WALL && c.getTile(t.x, y) == TILES.WALL) {
  //     return;
  //   }
  //   lst.push(tile+n);
  // })
  return lst;
}

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

  #debug = false;
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
    this.#debug = ui.checkbox(this.#debug, "test checkbox");
    ui.endVertical();
  }

  
  /** @type {import("./world.mjs").DetailedTile} */
  #a;
  /** @type {import("./world.mjs").DetailedTile} */
  #b;
  #path;
  #neighbors = [];
  #neighborSrc = null;
  /**
  * Render a frame.
  * @param {number} dt
  * @param {CanvasRenderingContext2D} ctx 
  */
  draw(dt, ctx) {
    this.#world.render(dt, ctx);
    
    this.#a = this.#world.probeTileFromWorld(this.#player.position);
    this.#b = this.#world.probeTileFromWorld(this.#renderer.camera.screenToWorld(input.mouse()))

    if(input.leftMouseDown()) {
      this.#path = findPath(this.#world, this.#a, this.#b);
      console.debug(this.#path);
    }
    if(input.rightMouseDown()) {
      this.#neighborSrc = this.#b;
      this.#neighbors = neighborsOf(this.#b.x + this.#b.y*CHUNK_SIZE, this.#b.chunk);
      console.debug(ctx.fillStyle);
    }
    if(this.#neighborSrc != null) {
      ctx.fillStyle = "rgba(255,255,0,0.2)";
      for(const n of this.#neighbors) {
        const p = idxToPos(n);
        ctx.fillRect(p.x*TILE_SIZE, p.y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }

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
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        const aa = idxToPos(k).add(off).mul(TILE_SIZE);
        const bb = idxToPos(v).add(off).mul(TILE_SIZE);
        ctx.moveTo(aa.x, aa.y);
        ctx.lineTo(bb.x, bb.y);
        ctx.stroke();
      });
      for(let i = this.#path.length-1; i >= 1; i--) {
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
    if(this.#b) {
      ctx.fillStyle = "rgba(0,0,255,0.2)";
      ctx.fillRect(this.#b.worldX*TILE_SIZE, this.#b.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
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