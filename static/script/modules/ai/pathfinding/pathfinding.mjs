'use strict';
import { Dict2D } from "../../lib/Dict2D.mjs";
import { manhatten } from "../../math/mod.mjs";
import Vector from "../../math/vector.mjs"
import World from "../../world.mjs";
import Chunk from "../../world/chunk.mjs";
import { CHUNK_AREA, CHUNK_SIZE, IS_SOLID, TILES } from "../../world/map.mjs";
import { state } from "./debug.mjs";

export * as debug from './debug.mjs';

const horizontals = [
  new Vector(0, -1),
  new Vector(0, 1),
  new Vector(-1, 0),
  new Vector(1, 0),
];

const diagonals = [
  new Vector(-1, -1),
  new Vector(1, 1),
  new Vector(1, -1),
  new Vector(-1, 1),
];

/**
 * 
 * @param {number} idx 
 * @returns {Vector}
 */
export const idxToPos = (idx) => new Vector(idx % CHUNK_SIZE, Math.floor(idx / CHUNK_SIZE));

const constructPath = (cameFrom, cur) => {
  const path = [cur];
  let c = cur;
  while (cameFrom.get(c) != undefined) {
    c = cameFrom.get(c);
    path.push(c)
  }
  return path;
}

// manhatten distance
// TODO: investigate octile distance
const dist = (a, b) => {
  return manhatten(a, b);
}

// a* implemented with the help of https://en.wikipedia.org/wiki/A*_search_algorithm

/**
 * Find the shortest path between two tiles.
 * @param {World} world
 * @param {import("../../world/map.mjs").DetailedTile} a 
 * @param {import("../../world/map.mjs").DetailedTile} b
 */
export const findPath = async (world, a, b, debug=false) => {
  // FIXME: implement cross-chunk pathing
  // TODO: do bi-directional pathing to exit impossible paths earlier
  if(!a || !b) return null;
  // if(a.chunk != b.chunk) return console.error("Pathfinding does not yet work across chunks!");
  if(IS_SOLID[b.tile]) return null;

  const lowestFscore = (set) => {
    // console.debug('fscore =======');
    // console.debug(fScore);
    let minScore = Number.POSITIVE_INFINITY;
    let minN = null;
    for (const n of set.values()) {
      // console.debug('n:', n);
      // console.debug('f:', fScore.get(n));
      if(fScore.get(n) < minScore) {
        minScore = fScore.get(n);
        minN = n;
      }
    }
    return minN;
  }

  // const aIdx = a.x + a.y * CHUNK_SIZE;
  // const bIdx = b.x + b.y * CHUNK_SIZE;
  const aPos = new Vector(a.worldX, a.worldY);
  const bPos = new Vector(b.worldX, b.worldY);

  const openSet = new Set();
  openSet.add(aPos);

  // cameFrom[n] = node immediately preceding it on the path
  const cameFrom = new Dict2D(null);
  cameFrom.set(aPos, null);

  // undefined == infinity here
  const gScore = new Dict2D(Number.POSITIVE_INFINITY); // cost of cheapest path from a to [n]
  gScore.set(aPos, 0);

  // undefined == infinity here
  // estimated cost of total path if going through [n]
  const fScore = new Dict2D(Number.POSITIVE_INFINITY); // fScore[n] = gScore[n] + dist(n, goal)
  fScore.set(aPos, dist(aPos, bPos));
  
  if(debug) {
    state.i = 0;
    state.order = new Dict2D();
  }

  /**
   * 
   * @param {Vector} tile 
   * @returns 
   */
  const neighborsOf = (tile) => {
    const lst = [];
    horizontals.forEach((off) => {
      const pos = Vector.add(off, tile);
      if(openSet.has(tile) || IS_SOLID[world.map.getTile(pos)]) return;
      lst.push(pos);
    });
    diagonals.forEach((off) => {
      const pos = Vector.add(off, tile);
      if(openSet.has(tile) || IS_SOLID[world.map.getTile(pos)]) return;
      if(IS_SOLID[world.map.getTile(new Vector(pos.x, tile.y))] && IS_SOLID[world.map.getTile(new Vector(tile.x, pos.y))]) {
        return;
      }
      lst.push(pos);
    })
    return lst;
  }
  
  let counter = 0;
  while (openSet.size > 0) {
    counter += 1;
    if(counter > CHUNK_AREA * 4) {
      console.error('potential infinite loop!');
      return null;
    }
    //TODO: use priority queue or min-heap to bring this down to O(logn)
    const cur = lowestFscore(openSet);
    if(debug) {
      state.cameFrom = cameFrom;
      state.fScore = fScore;
      state.gScore = gScore;
      state.order.set(cur, state.i);
      state.i += 1;
    }
    if (cur.x == bPos.x && cur.y == bPos.y) return constructPath(cameFrom, cur);

    openSet.delete(cur);
    
    const neighbors = neighborsOf(cur, openSet);
    neighbors.forEach(neighbor => {
      const tentGScore = gScore.get(cur) + 1;//dist(cur, neighbor);
      if (tentGScore < gScore.get(neighbor)) {
        cameFrom.set(neighbor, cur);
        gScore.set(neighbor, tentGScore);
        fScore.set(neighbor, tentGScore + dist(neighbor, bPos));
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