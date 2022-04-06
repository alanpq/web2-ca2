'use strict';
import Entity from "../../entity.mjs";
import { manhatten } from "../../math/mod.mjs";
import Vector from "../../math/vector.mjs";
import { Flags, registerDebug } from "../../ui/debug.mjs";
import World from "../../world.mjs";
import { tileToWorld, TILE_SIZE, worldToTile } from "../../world/map.mjs";

import * as pathfinding from "../pathfinding/pathfinding.mjs"
import * as debug from './debug.mjs';

export default class Enemy extends Entity {
  #debug = {targetDir: null, d: 0};
  constructor (position) {
    super(position, new Vector(10, 10), 100);
    this.speed = 105;
    this.drag = 0.5;

    registerDebug(Flags.AI, "draw", debug.draw.bind(this, {enemy: this, debug: this.#debug}));
  }
  

  #tile; // current tile
  #target = new Vector(); // current world-space destination
  #destination = new Vector();           // tile-space path destination
  #targetTile;            // destination tile (usually the player)
  #path;                  // path to destination tile
  get curTile() {
    if(!this.#path) return null;
    return this.#path[this.#path.length - (this.#curIdx+1)];
  }
  #curIdx = 1;            // current index along path

  get path() { return this.#path; }

  /**
   * 
   * @param {Vector} to 
   * @returns {boolean}
   */
  needNewPath(to) {
    const dist = manhatten(worldToTile(this.position), to);
    // we only need to recalculate a path if we have none or have finished our current,
    // or if the player has moved and we are within 20 tiles
    return (dist < 100 && (!this.#path || this.#curIdx >= this.#path.length)) ||
      (
        dist < 50 && (this.#path.length-this.#curIdx) < 30 &&
        (to.x != this.#destination.x || to.y != this.#destination.y)
      );
  }

  tick(dt) {
  }

  newTarget () {
    if(!this.curTile) return;
    this.#target = tileToWorld(this.curTile.clone().add(new Vector(0.5, 0.5)));
    this.#debug.target = this.#target;
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt, world) {
    const player = worldToTile(world.player.position);
    const playerTile = world.map.probeTile(player);
    this.#debug.tile = playerTile;
    this.#debug.curIdx = this.#curIdx;

    if(this.needNewPath(player)) { // player moved or no path
      this.#destination = player;
      this.#targetTile = playerTile;
      const cur = world.map.probeTile(worldToTile(this.position));
      pathfinding.findPath(world, cur, playerTile).then((path) => {
        if(path == null) {
          this.health = 0;
          return;
        }
        this.#path = path || []; 
        this.newTarget();
        this.#curIdx = 1;
      });
    }
    if(this.#path != null && this.#path.length > 1 && this.#target != null && this.#curIdx < this.#path.length) {
      let targetDir = Vector.sub(this.#target, this.position).div(TILE_SIZE);
      const d = targetDir.magnitude;
      this.#debug.d = d;
      if(d < 0.5) {
        if(this.#curIdx >= this.#path.length) {
          console.log('reached destination');
        } else {
          this.#curIdx += 1;
          this.newTarget();
        }
      }
      targetDir = targetDir.normalized();
      this.#debug.targetDir = targetDir;
      // this.input = this.#target.sub(this.position).normalized();
      this.velocity.add(targetDir.mul(dt*100));
    }
    super.physics(dt, world);
  }
  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "black";
    super.render(dt, ctx);
    const ww = (this.rect.width*1.5);
    const w = ww * (this.health/this.maxHealth);
    ctx.fillStyle = "red";
    ctx.fillRect(this.virtualPosition.x - (ww)/2, this.virtualPosition.y - this.rect.height*1.1, ww, 5);
    ctx.fillStyle = "green";
    ctx.fillRect(this.virtualPosition.x - (ww)/2, this.virtualPosition.y - this.rect.height*1.1, w, 5);
  }
}