import { randRange } from "../math/mod.mjs";
import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import Chunk from "./chunk.mjs"
import { CHUNK_AREA, CHUNK_SIZE, TILES } from "./map.mjs"

const setTile = (map, x, y, tile) => {
  map[y*CHUNK_SIZE + x] = tile;
}

const getTile = (map, pos) => {
  if(pos.x < 0 || pos.x >= CHUNK_SIZE || pos.y < 0 || pos.y >= CHUNK_SIZE) return TILES.VOID;
  return map[pos.y*CHUNK_SIZE + pos.x];
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
    return [];
  }
  let doors = [];
  // split room into two rooms
  const aspect = rect.width / rect.height;
  const orient = Math.random() < (Math.log10(aspect)+0.5);
  const fac = 0.2 + (Math.random()*0.6);
  if(orient) {
    const w = rect.width * fac;
    if(rect.width * fac <= 4 || rect.width * (1-fac) <= 4) return room(map, rect, 0, doors);
    const wallOff = Math.floor(w);
    doors = doors.concat(room(map, new Rect(
      rect.left,
      rect.top,
      wallOff+1,
      rect.height,
    ), depth-1));
    doors = doors.concat(room(map, new Rect(
      rect.left + wallOff,
      rect.top,
      rect.width - wallOff,
      rect.height,
    ), depth-1));
    let door = 0;
    do {
      door = randRange(rect.top+1, rect.bottom);
      if(door != wallOff) break;
    } while(true);
    doors.push([new Vector(rect.left + Math.floor(w), door), orient]);
  } else {
    const w = rect.height * fac;
    if(rect.height * fac <= 4 || rect.height * (1-fac) <= 4) return room(map, rect, 0, doors);
    const wallOff = Math.floor(w);
    doors = doors.concat(room(map, new Rect(
      rect.left,
      rect.top,
      rect.width,
      wallOff,
    ), depth-1));
    doors = doors.concat(room(map, new Rect(
      rect.left,
      rect.top + wallOff,
      rect.width,
      rect.height - wallOff,
    ), depth-1));
    let door = 0;
    do {
      door = randRange(rect.left+1, rect.right);
      if(door != wallOff+1) break;
    } while(true);
    doors.push([new Vector(door, rect.top + Math.floor(w)), orient]);
  }
  return doors;
}

// worst door hack of all time
const door = (map, pos, orient, retry=false) => {
  const xOff = orient + 0;
  const yOff = !orient + 0;
  const a = getTile(map, new Vector(pos.x - xOff, pos.y - yOff));
  const b = getTile(map, new Vector(pos.x + xOff, pos.y + yOff));
  if(a == TILES.WALL || b == TILES.WALL) {
    // setTile(map, pos.x, pos.y, TILES.VOID);
    if(retry) return;
    door(map, new Vector(pos.x - yOff, pos.y - xOff), orient, true);
    door(map, new Vector(pos.x + yOff, pos.y + xOff), orient, true);
  } else {
    setTile(map, pos.x, pos.y, TILES.FLOOR);
  }
}

/**
 * 
 * @param {Chunk} chunk 
 */
export const generateChunk = async (chunk, map) => {
  const doors = room(map, new Rect(0, 0, CHUNK_SIZE+1, CHUNK_SIZE), 4);
  for(const d of doors) {
    door(map, d[0], d[1], false);
  }
  return map;
}