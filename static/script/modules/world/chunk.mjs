import { images } from "../images.mjs";
import { generateChunk } from "./generation.mjs";
import { CHUNK_AREA, CHUNK_SIZE, CHUNK_WORLD_SIZE, TILES, TILE_COLORS, TILE_SIZE } from "./map.mjs";

export default class Chunk {
  /** x in chunk-space */
  x;
  /** y in chunk-space */
  y;

  /** @type {Tile[]} */
  #map = []

  doored = [false, false];
  populated = false;

  constructor(x, y) {
    this.x = x;
    this.y = y;

    for(let i = 0; i < CHUNK_AREA; i++) {
      this.#map[i] = TILES.FLOOR;
    }

    generateChunk(this, this.#map).then(map => {
      this.#map = map;
    });
  }
  /**
   * Render the chunk.
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    for(let i = 0; i < CHUNK_AREA; i++) {
      if(this.#map[i] == TILES.FLOOR) continue;
      const sx = (this.#map[i] % 3) * TILE_SIZE;
      const sy = Math.floor(this.#map[i] / 3) * TILE_SIZE;
      ctx.drawImage(images["tiles.png"], sx, sy, TILE_SIZE, TILE_SIZE, (i % CHUNK_SIZE) * TILE_SIZE + CHUNK_WORLD_SIZE*this.x,
                    Math.floor(i / CHUNK_SIZE) * TILE_SIZE + CHUNK_WORLD_SIZE*this.y,
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

  setTile(x,y, tile) {
    const i = y * CHUNK_SIZE + x;
    this.setTileFromIdx(i, tile);
  }

  setTileFromIdx(i, tile) {
    this.#map[i] = tile;
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