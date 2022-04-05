'use strict';

import { Camera } from "./camera.mjs";
import Rect from "./math/rect.mjs";
import Vector from "./math/vector.mjs";
import Player from "./player/player.mjs";
import Map, { CHUNK_SIZE, TILE_SIZE } from "./world/map.mjs";

export default class World {
  map = new Map();
  player;

  /** @type {Camera} */
  camera; // i hate this but cant be bothered
  constructor(camera) {
    this.player = new Player(Vector.zero.clone());
    this.player.position.x = this.player.position.y = (CHUNK_SIZE*TILE_SIZE/2)+TILE_SIZE/2;
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
    this.#entities.forEach(e => e.tick(dt));
  }
  
  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt) {
    this.#entities.forEach(e => e.physics(dt, this));
    this.player.physics(dt, this);
  }

  render(dt, ctx) {
    this.map.render(dt, ctx);
    this.player.render(dt, ctx);
    this.#entities.forEach(e => e.render(dt, ctx));
  }
}