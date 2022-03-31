import Vector from "../math/vector.mjs";
import Chunk from "./chunk.mjs";

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

export default class Map {
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