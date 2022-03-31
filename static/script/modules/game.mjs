'use strict';
import { FONTS, PHYSICS_INTER } from "./constants.mjs";
import Player, { PLAYER_SIZE, PLAYER_SIZE_HALF } from "./player/player.mjs";
import Renderer from "./renderer.mjs";

import * as input from './input/mod.mjs';
import * as bullets from './weapons/bullets.mjs';

import World from "./world.mjs";
import * as pathfinding from "./ai/pathfinding/pathfinding.mjs";
import Vector from "./math/vector.mjs";
import UI from './ui/ui.mjs';
import Rect from "./math/rect.mjs";
import { setFlag, getFlag, registerDebug, Flags } from "./ui/debug.mjs";
import { Align } from "./ui/positioningContext.mjs";
import Dummy from "./ai/enemy/dummy.mjs";
import Entity from "./entity.mjs";
import { TILE_SIZE } from "./world/map.mjs";

export default class Game {
  #loaded = false;
  /** @type {Renderer} */
  #renderer;
  #world;

  /** @type {Entity[]} */
  #entities = [];


  get loaded() {
    return this.#loaded;
  }

  constructor(renderer) {
    this.#renderer = renderer;
    
    this.#world = new World();

    // this.#renderer.camera.position = this.#world.player.position;

    // pathfinding.debug.state.world = this.#world;
    // pathfinding.debug.state.renderer = this.#renderer;

    this.#renderer.listen(
      (dt, ctx) => {this.draw(dt, ctx)},
      (dt, ui) => {this.ui(dt, ui)},
      (dt) => {this.tick(dt)},
      (dt) => {this.physics(dt)},
    )
  }
  /** @type {HTMLAudioElement} */
  #audio;
  async load() {
    if(this.#loaded) return;
    console.debug("Loading game...");

    this.#audio = new Audio(URL_BASE + "/static/sound/machine-gun.mp3");
    this.#audio.loop = true;
    await new Promise((resolve, reject) => {
      this.#audio.addEventListener("canplaythrough", e => {
        resolve();
      });
    })

    this.#loaded = true;
    registerDebug(Flags.PATHFINDING, "draw", pathfinding.debug.draw);
    registerDebug(Flags.PATHFINDING, "tick", pathfinding.debug.tick);

    bullets.registerBulletType("pistol", {
      type: bullets.ProjectileType.PHYSICS,
      params: {
        drag: 1,
        restitution: 0,
        size: new Vector(5, 5),
        trailColor: "yellow",
        trailLength: 10,
      }
    })
  }

  start() {
    this.#entities.push(new Dummy(this.#world, new Vector(TILE_SIZE*5,TILE_SIZE*5)));
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
      ui.startArea(new Rect(0,0, ui.ctx.canvas.width/3, ui.ctx.canvas.height), Align.START);
      ui.startVertical();
      ui.text(`frametime: ${(dt*1000).toFixed(3).padStart(6)}ms`);

      ui.space();

      ui.text(`pos: ${this.#world.player.position.toString(3)}`);
      ui.text('vel: ' + this.#world.player.velocity.toString(3));

      ui.space();

      ui.text('DEBUG FLAGS');
      setFlag(Flags.PATHFINDING, ui.checkbox(getFlag(Flags.PATHFINDING), "pathfinding visualisation"));
      setFlag(Flags.PLAYER, ui.checkbox(getFlag(Flags.PLAYER), "player debug"));
      setFlag(Flags.UI, ui.checkbox(getFlag(Flags.UI), "ui debug"));

      ui.space();
      
      ui.hidden = !getFlag(Flags.PATHFINDING);
      ui.text('PATHFINDING VIS:');
      ui.text('Left click to place point A.');
      ui.text('Right click to place point B.');
      ui.hidden = false;
      
      ui.endVertical();
      ui.endArea();
    }
  }

  
  /** @type {import("./world/map.mjs").DetailedTile} */
  #a;
  /** @type {import("./world/map.mjs").DetailedTile} */
  #b;
  #path;
  /**
  * Render a frame.
  * @param {number} dt
  * @param {CanvasRenderingContext2D} ctx 
  */
  draw(dt, ctx) {
    this.#world.render(dt, ctx);

    bullets.draw(dt, ctx);

    ctx.fillStyle = "red";
    ctx.fillRect(this.#crosshair.x-2.5, this.#crosshair.y-2.5, 5, 5);

    this.#entities.forEach(e => e.render(dt, ctx));
    
    this.#world.player
      .render(dt, ctx);
  }

  /** @type {Vector} */
  #crosshair = Vector.zero;

  #gunTime = 0;
  #gunInterval = 0.105;

  /**
   * Do a tick.
   */
  tick(dt) {
    this.#entities.forEach(e => e.tick(dt));
    this.#world.tick(dt);
    if(input.buttonDown("debug")) {
      this.#debug ^= true;
    }

    if(input.leftMouseDown()) this.#audio.play();
    if(input.leftMouseUp()) {this.#audio.pause();this.#audio.currentTime = 0;}

    if(input.leftMouse()) {
      this.#gunTime += dt;
      if(this.#gunTime > this.#gunInterval) {
        bullets.createBullet("pistol", {
          pos: this.#world.player.position.clone().add(new Vector(PLAYER_SIZE_HALF,PLAYER_SIZE_HALF)),
          vel: Vector.sub(Vector.random().mul(TILE_SIZE*0.5).add(this.#crosshair), this.#world.player.position).normalized().mul(600),
          damage: 10,
          life: 5,
        })
        this.#gunTime = 0;
      }
    }

    this.#crosshair = this.#renderer.camera.screenToWorld(input.mouse());
    this.#renderer.camera.position = Vector.lerp(this.#world.player.position, this.#crosshair, 0.3);

    // this.#renderer.camera.position = this.#player.position;
  }
  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   */
  physics(dt) {
    this.#entities.forEach(e => e.physics(dt, this.#world));
    bullets.physics(dt, this.#world);
    this.#world.physics(dt, this.#world);
  }
}