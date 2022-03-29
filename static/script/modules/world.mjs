export const CHUNK_SIZE = 30;
export const CHUNK_AREA = CHUNK_SIZE*CHUNK_SIZE;

export const TILE_SIZE = 32;

/**
 * Convert from world-space to tile-space
 * @param {number} x 
 * @param {number} y 
 * @returns {[number, number]}
 */
export const worldToTile = ([x, y]) => {
  return [Math.floor(x/TILE_SIZE), Math.floor(y/TILE_SIZE)];
}
/**
 * Convert from tile-space to chunk-space
 * @param {number} x 
 * @param {number} y 
 * @returns {[number, number]}
 */
export const tileToChunk = ([x, y]) => {
  return [Math.floor(x/CHUNK_SIZE), Math.floor(y/CHUNK_SIZE)];
}
/**
 * Convert from world-space to chunk-space
 * @param {number} x 
 * @param {number} y 
 * @returns {[number, number]}
 */
export const worldToChunk = ([x, y]) => {
  return tileToChunk(worldToTile([x,y]));
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

  getChunk(x, y) {
    if(!this.#chunks[y]) return;
    return this.#chunks[y][x];
  }

  getChunkFromWorld(x, y) {
    const p = worldToChunk([x,y]);
    return this.getChunk(p[0], p[1]);
  }

  /**
   * 
   * @param {Vector} pos 
   * @returns {DetailedTile}
   */
  probeTileFromWorld(pos) {
    const t = worldToTile([pos.x,pos.y]);
    const c = this.getChunk(...tileToChunk(t));
    if(!c) return {tile: null};
    const xx = t[0] - c.x * CHUNK_SIZE;
    const yy = t[1] - c.y * CHUNK_SIZE;
    return {tile: c.getTile(t[0], t[1]),
      chunk: c,
      x: xx, y: yy,
      worldX: t[0], worldY: t[1]
    };
  }

  getTileFromWorld(x,y) {
    return this.probeTileFromWorld(x,y).tile;
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

export const TILES = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
}
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