'use strict';
import Vector from "../../math/vector.mjs"
import World from "../../world.mjs";
import Chunk from "../../world/chunk.mjs";
import { CHUNK_AREA, CHUNK_SIZE, TILES } from "../../world/map.mjs";
import { state } from "./debug.mjs";

export * as debug from './debug.mjs';

const horizontals = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

const diagonals = [
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
];

/**
 * 
 * @param {number} idx 
 * @returns {Vector}
 */
export const idxToPos = (idx) => new Vector(idx % CHUNK_SIZE, Math.floor(idx / CHUNK_SIZE));

const manhatten = (a,b) => {
  return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
}

const constructPath = (chunk, cameFrom, cur) => {
  const path = [idxToPos(cur).add(new Vector(chunk.x, chunk.y).mul(CHUNK_SIZE))];
  let c = cur + 0;
  while (cameFrom[c] != undefined) {
    c = cameFrom[c];
    path.push(idxToPos(c).add(new Vector(chunk.x, chunk.y).mul(CHUNK_SIZE)))
  }
  return path;
}

// manhatten distance
// TODO: investigate octile distance
const dist = (a, b) => {
  const aa = idxToPos(a);
  const bb = idxToPos(b);
  return manhatten(aa, bb);
}

/**
 * 
 * @param {Chunk} chunk 
 * @param {Vector} pos 
 * @returns 
 */
const createTile = (chunk, pos) => {
  return {
    tile: chunk.getTile(pos.x, pos.y),
    chunk,
    x: pos.x, y: pos.y
  }
}

/**
 * 
 * @param {Chunk} chunk 
 * @param {string} exit 
 */
const fromExit = (chunk, exit) => {
  if(!chunk) return null;
  if(!chunk.exits[exit]) return null;
  return createTile(chunk, chunk.exits[exit]);
}

/**
 * Find the shortest path between two tiles.
 * @param {World} world
 * @param {import("../../world/map.mjs").DetailedTile} a 
 * @param {import("../../world/map.mjs").DetailedTile} b
 */
export const findPath = (world, a, b) => {
  if(a.chunk == b.chunk) {
    
    const p = pathfind(world, a, b);
    console.debug(p);
    return p;
  }
  const aPos = new Vector(a.chunk.x, a.chunk.y);
  const bPos = new Vector(b.chunk.x, b.chunk.y);
  let pos = aPos.clone();
  const dX = Math.sign(b.chunk.x - a.chunk.x);
  const dY = Math.sign(b.chunk.y - a.chunk.y);

  const dist = manhatten(aPos, bPos);
  console.debug("total dist", dist);
  console.debug('dx:', dX, 'dy:', dY);

  /** @type {Vector[]} */
  let path = [];
  let exit;
  let exitOpp;
  let prevChunk;
  let i = 0;
  let j = 0;
  while(i <= dist) {
    const c = world.map.getChunk(pos);
    if(exit && prevChunk != c) {
      console.debug(i, j, `(${prevChunk.x}, ${prevChunk.y})`, '-->', pos.toString());
      if(i==1) {
        const p = pathfind(world, a, fromExit(prevChunk, exit));
        if(!p) return null;
        p.reverse();
        path = path.concat(p);
        path.push(p[p.length-1].clone().add(new Vector(dX, dY)));
      }
      // path.push(pathfind(world, fromExit(prevChunk, exit), fromExit(prevChunk, exitOpp)))
    }
    prevChunk = c;
    if(j % 2 == 0) {
      pos.x += dX;
      if(dX != 0) {
        i+=1;
        exit = dX > 0 ? "right" : "left";
        exitOpp = dX > 0 ? "left" : "right";
      }
    } else {
      pos.y += dY;
      if(dY != 0) {
        i+=1;
        exit = dY > 0 ? "bottom" : "top";
        exitOpp = dY > 0 ? "top" : "bottom";
      }
    }
    j+=1;
  }
  console.log('final', exit, exitOpp);
  const p = pathfind(world, fromExit(prevChunk, exitOpp), b);
  if(!p) return null;
  p.reverse();
  // path.push(p[0].clone().add(new Vector(dX, dY)));
  path = path.concat(p);
  path.reverse();
  console.debug(path);
  return path;
}

// a* implemented with the help of https://en.wikipedia.org/wiki/A*_search_algorithm

const pathfind = (world, a, b, debug=false) => {
  // FIXME: implement cross-chunk pathing
  // TODO: do bi-directional pathing to exit impossible paths earlier
  console.debug('pathing from', a, 'to', b);
  if(!a || !b) return null;
  if(a.chunk != b.chunk) return console.error("Pathfinding does not yet work across chunks!");
  if(b.tile == TILES.WALL) return null;
  const c = a.chunk;

  const aIdx = a.x + a.y * CHUNK_SIZE;
  const bIdx = b.x + b.y * CHUNK_SIZE;

  const openSet = new Set();
  openSet.add(aIdx);

  // cameFrom[n] = node immediately preceding it on the path
  const cameFrom = {};
  cameFrom[aIdx] = null;

  // undefined == infinity here
  const gScore = {}; // cost of cheapest path from a to [n]
  gScore[aIdx] = 0;

  // undefined == infinity here
  // estimated cost of total path if going through [n]
  const fScore = {}; // fScore[n] = gScore[n] + dist(n, goal)
  fScore[aIdx] = dist(aIdx, bIdx);
  
  if(debug) {
    state.i = 0;
    state.order = {};
  }

  const neighborsOf = (tile) => {
    if(tile < 0 || tile >= CHUNK_AREA) return;
    const lst = [];
    const t = idxToPos(tile);
    horizontals.forEach(([xo, yo]) => {
      const n = xo + yo * CHUNK_SIZE;
      const x = t.x + xo;
      const y = t.y + yo;
      if(x < 0 || x >= CHUNK_SIZE) return;
      if(y < 0 || y >= CHUNK_SIZE) return;
      if(openSet.has(tile) || c.getTile(x, y) == TILES.WALL) return;
      lst.push(tile+n);
    });
    diagonals.forEach(([xo, yo]) => {
      const n = xo + yo * CHUNK_SIZE;
      const x = t.x + xo;
      const y = t.y + yo;
      if(x < 0 || x >= CHUNK_SIZE) return;
      if(y < 0 || y >= CHUNK_SIZE) return;
      if(openSet.has(tile) || c.getTile(x, y) == TILES.WALL) return;
      if(c.getTile(x, t.y) == TILES.WALL && c.getTile(t.x, y) == TILES.WALL) {
        return;
      }
      lst.push(tile+n);
    })
    return lst;
  }
  const lowestFscore = (set) => {
    let minScore = Number.POSITIVE_INFINITY;
    let minN = -1;
    for (const n of set.values()) {
      if(fScore[n] < minScore) {
        minScore = fScore[n];
        minN = n;
      }
    }
    return minN;
  }
  let counter = 0;
  while (openSet.size > 0) {
    counter += 1;
    if(counter > CHUNK_AREA * 4) {
      console.error('potential infinite loop!');
      break;
    }
    //TODO: use priority queue or min-heap to bring this down to O(logn)
    const cur = lowestFscore(openSet);
    if(debug) {
      state.cameFrom = cameFrom;
      state.fScore = fScore;
      state.gScore = gScore;
    }
    if (cur == bIdx) return constructPath(a.chunk, cameFrom, cur);

    openSet.delete(cur);
    
    const neighbors = neighborsOf(cur, openSet);
    neighbors.forEach(neighbor => {
      const tentGScore = gScore[cur] + 1;//dist(cur, neighbor);
      if (gScore[neighbor] == undefined || tentGScore < gScore[neighbor] ) {
        if(debug) {
          if(!state.order[neighbor])
            state.order[neighbor] = state.i;
          state.i += 1;
        }
        cameFrom[neighbor] = cur;
        gScore[neighbor] = tentGScore;
        fScore[neighbor] = tentGScore + dist(neighbor, bIdx);
        openSet.add(neighbor);
      }
    })
  }
  if(debug) {
    state.cameFrom = cameFrom;
    state.fScore = fScore;
    state.gScore = gScore;
  }
  return null;
}