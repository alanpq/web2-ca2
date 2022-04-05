import Rect from "../math/rect.mjs";
import Chunk from "./chunk.mjs"
import { CHUNK_AREA, CHUNK_SIZE, TILES } from "./map.mjs"


const randRange = (min, max) => {
  return Math.floor(Math.random() * (max-min)) + min;
}

const setTile = (map, x, y, tile) => {
  map[y*CHUNK_SIZE + x] = tile;
}

/**
 * 
 * @param {Tile[]} map 
 * @param {Rect} rect 
 */
const room = (map, rect, depth) => {
  // base case
  if(depth <= 0) {
    for(let i = rect.left; i < rect.right; i++) {
      map[i + (rect.top*CHUNK_SIZE)] = TILES.WALL;
      map[i + (rect.bottom*CHUNK_SIZE)] = TILES.WALL;
    }
    for(let i = rect.top; i < rect.bottom; i++) {
      map[i*CHUNK_SIZE + rect.left] = TILES.WALL;
      map[i*CHUNK_SIZE + (CHUNK_SIZE-1) + rect.right] = TILES.WALL;
    }
    return;
  }
  // split room into two rooms
  const aspect = rect.width / rect.height;
  const orient = Math.random() < (Math.log10(aspect)+0.5);
  const fac = 0.2 + (Math.random()*0.6);
  if(orient) {
    const w = rect.width * fac;
    if(Math.floor(w) <= 2) return room(map, rect, 1);
    room(map, new Rect(
      rect.left,
      rect.top,
      Math.floor(w)+1,
      rect.height,
    ), depth-1);
    room(map, new Rect(
      rect.left + Math.floor(w),
      rect.top,
      rect.width - Math.floor(w),
      rect.height,
    ), depth-1);
    setTile(map, rect.left + Math.floor(w), randRange(rect.top+1, rect.bottom-1), TILES.FLOOR);
  } else {
    const w = rect.height * fac;
    if(Math.floor(w) <= 2) return room(map, rect, 1);
    room(map, new Rect(
      rect.left,
      rect.top,
      rect.width,
      Math.floor(w),
    ), depth-1);
    room(map, new Rect(
      rect.left,
      rect.top + Math.floor(w),
      rect.width,
      rect.height - Math.floor(w),
    ), depth-1);
    setTile(map, randRange(rect.left+1, rect.right-1), rect.top + Math.floor(w), TILES.FLOOR);
  }
  
}

/**
 * 
 * @param {Chunk} chunk 
 */
export const generateChunk = (chunk, map) => {
  room(map, new Rect(0, 0, CHUNK_SIZE, CHUNK_SIZE-1), 4);
  return map;
}