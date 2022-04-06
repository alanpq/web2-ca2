'use strict';

import { Camera } from "./camera.mjs";
import Rect from "./math/rect.mjs";
import Vector from "./math/vector.mjs";
import Player from "./player/player.mjs";
import Map, { CHUNK_SIZE, TILES, TILE_SIZE, worldToTile } from "./world/map.mjs";
import * as bullets from './weapons/bullets.mjs';
import { randRange } from "./math/mod.mjs";
import Entity from "./entity.mjs";

export default class World {
  map = new Map();
  player;

  /** @type {Camera} */
  camera; // i hate this but cant be bothered
  constructor(camera) {
    this.player = new Player(Vector.zero.clone());
    while (true) {
      this.player.position.x = (randRange(0, CHUNK_SIZE)+0.5) * TILE_SIZE;
      this.player.position.y = (randRange(0, CHUNK_SIZE)+0.5) * TILE_SIZE;
      if(this.map.getTile(worldToTile(this.player.position)) == TILES.FLOOR) break;
    }
    this.camera = camera;
  }

  /** @type {Entity[]} */
  #entities = [];

  get entities() {return this.#entities;}

  addEntity(entity) {
    this.#entities.push(entity);
  }

  /**
   * Do a tick.
   * @param {number} dt
   */
  tick(dt) {
    let i = -1;
    let len = this.#entities.length;
    while(i < len) {
      i++;
      const e = this.#entities[i];
      if(!e) continue;
      const d = e.dead;
      e.tick(dt);
      if(e.dead && !d) {
        e.onDead();
      }
    }
  }
  
  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt) {
    this.#entities.forEach(e => {if(!e) return; e.physics(dt, this);});
    this.player.physics(dt, this);
    bullets.physics(dt, this);
  }

  render(dt, ctx) {
    // this.map.render(dt, ctx);
    this.#entities.forEach(e => {if(!e || !e.dead) return; e.render(dt, ctx);});
    this.player.render(dt, ctx);
    this.#entities.forEach(e => {if(!e || e.dead) return; e.render(dt, ctx);});
  }
}