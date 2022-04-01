'use strict';
import Entity from "../../entity.mjs";
import Vector from "../../math/vector.mjs";
import { Flags, registerDebug } from "../../ui/debug.mjs";
import World from "../../world.mjs";
import { tileToWorld, TILE_SIZE, worldToTile } from "../../world/map.mjs";

import * as pathfinding from "../pathfinding/pathfinding.mjs"
import * as debug from './debug.mjs';

export default class Enemy extends Entity {
  #debug = {targetDir: null, d: 0};
  constructor (position) {
    super(position, new Vector(10, 10));
    this.speed = 105;
    this.drag = 0.5;

    registerDebug(Flags.AI, "draw", debug.draw.bind(this, {enemy: this, debug: this.#debug}));
  }

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

  tick(dt) {
  }

  newTarget() {
    if(!this.#path || !this.#targetTile) return;
    this.#target = tileToWorld(pathfinding.idxToPos(this.curTile).add(new Vector(0.5, 0.5)), this.#targetTile.chunk);
    this.#debug.target = this.#target;
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt, world) {
    const player = worldToTile(world.player.position);
    const tile = world.map.probeTile(player);
    this.#debug.tile = tile;
    this.#debug.curIdx = this.#curIdx;

    if((player.x != this.#destination.x || player.y != this.#destination.y) || !this.#path) {
      // this.#testDone = true;
      this.#destination = player;
      this.#targetTile = tile;
      const cur = world.map.probeTile(worldToTile(this.position));
      this.#path = pathfinding.findPath(world, cur, tile);
      this.#curIdx = 1;
      this.newTarget();
      console.log('new path');
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
  }
}