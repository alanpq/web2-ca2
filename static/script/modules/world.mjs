'use strict';

import Rect from "./math/rect.mjs";
import Vector from "./math/vector.mjs";

export const CHUNK_SIZE = 20;
export const CHUNK_AREA = CHUNK_SIZE*CHUNK_SIZE;

export const TILE_SIZE = 32;

/**
 * Convert from world-space to tile-space
 * @param {Vector} pos
 * @returns {Vector}
 */
export const worldToTile = (pos) => {
  return new Vector(Math.floor(pos.x/TILE_SIZE), Math.floor(pos.y/TILE_SIZE));
}
/**
 * Convert from tile-space to chunk-space
 * @param {Vector} pos
 * @returns {Vector}
 */
export const tileToChunk = (pos) => {
  return new Vector(Math.floor(pos.x/CHUNK_SIZE), Math.floor(pos.y/CHUNK_SIZE));
}
/**
 * Convert from world-space to chunk-space
 * @param {Vector} pos
 * @returns {Vector}
 */
export const worldToChunk = (pos) => {
  return tileToChunk(worldToTile(pos));
}

export class World {
  /** @type {{[y: number]: {[x: number]: Chunk}}} */
  #chunks = {}
  constructor() {
    this.#chunks[0] = {};
    this.#chunks[0][0] = new Chunk(0,0);
  }

  render(dt, ctx) {
    const cols = Object.values(this.#chunks);
    cols.forEach(col => {
      Object.values(col).forEach(chunk => chunk.render(dt, ctx));
    })
  }

  /**
   * 
   * @param {Vector} pos
   * @returns {Chunk}
   */
  getChunk(pos) {
    if(!this.#chunks[pos.y]) return;
    return this.#chunks[pos.y][pos.x];
  }
  /**
   * 
   * @param {Vector} pos
   * @returns {Chunk}
   */
  getChunkFromWorld(pos) {
    return this.getChunk(worldToChunk(pos));
  }

  /**
   * 
   * @param {Vector} pos 
   * @returns {DetailedTile}
   */
  probeTileFromWorld(pos) {
    const t = worldToTile(pos);
    const c = this.getChunk(tileToChunk(t));
    if(!c) return {tile: null};
    const xx = t.x - c.x * CHUNK_SIZE;
    const yy = t.y - c.y * CHUNK_SIZE;
    return {tile: c.getTile(t.x, t.y),
      chunk: c,
      x: xx, y: yy,
      worldX: t.x, worldY: t.y
    };
  }
/**
   * 
   * @param {Vector} pos 
   * @returns {Tile}
   */
  getTileFromWorld(pos) {
    // console.debug(pos, this.probeTileFromWorld(pos));
    return this.probeTileFromWorld(pos).tile;
  }

  /**
   * 
   * @param {Rect} rect 
   */
  tileCollides(rect) {
    const left = Math.floor(rect.left / TILE_SIZE) * TILE_SIZE;
    const right = Math.floor(rect.right / TILE_SIZE) * TILE_SIZE;
    const top = Math.floor(rect.top / TILE_SIZE) * TILE_SIZE;
    const bottom = Math.floor(rect.bottom / TILE_SIZE) * TILE_SIZE;
    for(let x = left; x<=right; x++) {
      for(let y = top; y <= bottom; y++) {
        const v = new Vector(x,y);
        // console.log(v.toString(),this.getTileFromWorld(v));
        if(this.getTileFromWorld(v) == TILES.WALL) {
          return v.mul(1/TILE_SIZE);
        }
        
      }
    }
    return null;
  }


}

/**
 * @typedef DetailedTile
 * @type {object}
 * @prop {Tile} tile the tile
 * @prop {Chunk} chunk chunk the tile is from
 * @prop {number} x tile-space x relative to chunk
 * @prop {number} y tile-space y relative to chunk
 * @prop {number} worldX tile-space x relative to origin
 * @prop {number} worldY tile-space y relative to origin
 */

/** 
 * @typedef Tile
 * @type {number}
 */

/**
 * Enum for Tile types.
 * @readonly
 * @enum {number}
 */
export const TILES = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
}
/**
 * Enum for Tile colors.
 * @readonly
 * @enum {string}
 */
export const TILE_COLORS = [
  "black",
  "darkgray",
  "blue",
];

class Chunk {
  /** x in chunk-space */
  x;
  /** y in chunk-space */
  y;

  /** @type {Tile[]} */
  #map = []

  constructor(x, y) {
    this.x = x;
    this.y = y;

    for(let i = 0; i < CHUNK_AREA; i++) {
      this.#map[i] = TILES.FLOOR + (Math.random() < 0.2);
    }
  }
  /**
   * Render the chunk.
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    for(let i = 0; i < CHUNK_AREA; i++) {
      ctx.strokeStyle = "none";
      ctx.fillStyle = TILE_COLORS[this.#map[i]];
      ctx.fillRect((i % CHUNK_SIZE) * TILE_SIZE, Math.floor(i / CHUNK_SIZE) * TILE_SIZE,
                    TILE_SIZE+1, TILE_SIZE+1);
    }
  }
/**
   * 
   * @param {number} x
   * @param {number} y
   * @returns {Tile}
   */
  getTile(x, y) {
    const i = y * CHUNK_SIZE + x;
    return this.getTileFromIdx(i);
  }

  /**
   * 
   * @param {number} i 
   * @returns {Tile}
   */
  getTileFromIdx(i) {
    if(i < 0 || i >= CHUNK_AREA) return null;
    return this.#map[i];
  }
}