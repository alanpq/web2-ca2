import { FONTS, PHYSICS_INTER } from "./constants.mjs";
import Player from "./player.mjs";
import Renderer from "./renderer.mjs";

import * as input from './input/mod.mjs';

import { CHUNK_AREA, CHUNK_SIZE, TILES, TILE_SIZE, World } from "./world.mjs";
import * as pathfinding from "./ai/pathfinding/pathfinding.mjs";
import Vector from "./math/vector.mjs";
import UI from './ui/ui.mjs';
import Rect from "./math/rect.mjs";
import { ui, setFlag, getFlag, registerDebug, Flags } from "./ui/debug.mjs";

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

    pathfinding.debug.state.world = this.#world;
    pathfinding.debug.state.renderer = this.#renderer;


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
    registerDebug(Flags.PATHFINDING, "draw", pathfinding.debug.draw);
    registerDebug(Flags.PATHFINDING, "tick", pathfinding.debug.tick);
  }

  start() {
  }

  destroy() {
    if(!this.#loaded) return; // no need to unload anything if not loaded
    console.debug("Destroying game...");
  }

  ////// ACTUAL GAME STUFF

  #debug = true; // FIXME: make this false by default before prod
  /**
   * 
   * @param {number} dt Deltatime in seconds
   * @param {UI} ui UI Object
   */
  ui(dt, ui) {
    // debugMenu(dt, ui);

    if(this.#debug) {
      ui.font.color = "white";
      ui.font.family = FONTS.MONO;
      ui.startArea(new Rect(0,0, ui.ctx.canvas.width, ui.ctx.canvas.height));
      ui.startVertical();
      ui.text(`frametime: ${(dt*1000).toFixed(3)}`);
      ui.text(`p: ${this.#player.position.toString()}`);

      setFlag(Flags.PATHFINDING, ui.checkbox(getFlag(Flags.PATHFINDING), "pathfinding debug mode"));
      ui.text(getFlag(Flags.PATHFINDING) ? 'Left click to place point A. Right click to place point B' : '');
      
      ui.endVertical();
      ui.endArea();
    }
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
    
    this.#player
      .render(dt, ctx);
  }

  /**
   * Do a tick.
   */
  tick(dt) {
    if(input.buttonDown("debug")) {
      this.#debug ^= true;
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