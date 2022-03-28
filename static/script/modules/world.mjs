export const CHUNK_SIZE = 10;
export const CHUNK_AREA = CHUNK_SIZE*CHUNK_SIZE;

export const TILE_SIZE = 32;

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
    return this.#chunks[y][x];
  }
}

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
]

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
      this.#map[i] = TILES.VOID + Math.floor(Math.random() * 2);
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
}