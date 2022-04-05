import Chunk from "./chunk.mjs"
import { CHUNK_AREA, CHUNK_SIZE, TILES } from "./map.mjs"

/**
 * 
 * @param {Chunk} chunk 
 */
export const generateChunk = (chunk, map) => {
  for(let i = 0; i < CHUNK_SIZE; i++) {
    map[i] = TILES.WALL;
    map[CHUNK_AREA - i - 1] = TILES.WALL;
    map[i*CHUNK_SIZE] = TILES.WALL;
    map[i*CHUNK_SIZE + (CHUNK_SIZE-1)] = TILES.WALL;
  }
  return map;
}