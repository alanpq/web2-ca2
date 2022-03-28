import Vector from "../math/vector.mjs"
import { CHUNK_AREA, CHUNK_SIZE, TILES, World } from "../world.mjs"

const neighborMap = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const diagonals = [
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
];

// a* implemented with the help of https://en.wikipedia.org/wiki/A*_search_algorithm

/**
 * 
 * @param {number} idx 
 * @returns {Vector}
 */
export const idxToPos = (idx) => new Vector(idx % CHUNK_SIZE, Math.floor(idx / CHUNK_SIZE));

// a* heuristic
const heur = (a,b) => {
  return Vector.sub(idxToPos(b),idxToPos(a)).magnitude;
  // TODO: see if sqrMag or mag is better
}

const lowestFscore = (set) => {
  let minScore = Number.POSITIVE_INFINITY;
  let minN = -1;
  for (const n of set.entries()) {
    if(n[1] < minScore) {
      minScore = n[1];
      minN = n[0];
    }
  }
  return minN;
}

const constructPath = (cameFrom, cur) => {
  const path = [cur];
  let c = cur + 0;
  while (cameFrom[c] != undefined) {
    c = cameFrom[c];
    path.push(c)
  }
  return path;
}



const dist = (a, b) => {
  // FIXME: implement
  return Vector.sub(idxToPos(b),idxToPos(a)).magnitude;
}

/**
 * Find the shortest path between two tiles.
 * @param {World} world
 * @param {import("../world.mjs").DetailedTile} a 
 * @param {import("../world.mjs").DetailedTile} b 
 */
export const findPath = (world, a, b) => {
  // FIXME: implement cross-chunk pathing
  // FIXME: find the bug causing weird detours
  if(a.chunk != b.chunk) return console.error("Pathfinding does not yet work across chunks!");

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
  const fScore = {};
  fScore[aIdx] = 0;

  const neighborsOf = (tile) => {
    if(tile < 0 || tile >= CHUNK_AREA) return;
    // FIXME: implement
    const lst = [];
    const t = idxToPos(tile);
    neighborMap.forEach(([xo, yo]) => {
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
  let counter = 0;
  while (openSet.size > 0) {
    counter += 1;
    if(counter > 500) {
      console.error('potential infinite loop!');
      break;
    }
    //TODO: use priority queue or min-heap to bring this down to O(logn)
    const cur = lowestFscore(openSet);
    if (cur == bIdx) return constructPath(cameFrom, cur);

    openSet.delete(cur);
    
    const neighbors = neighborsOf(cur, openSet);
    neighbors.forEach(neighbor => {
      const cG = gScore[cur];
      const d = dist(cur, neighbor);
      const tentGScore = cG + d;
      const nG = gScore[neighbor] == undefined ? Number.POSITIVE_INFINITY : gScore[neighbor];
      if (tentGScore < nG ) {
        cameFrom[neighbor] = cur;
        gScore[neighbor] = tentGScore;
        fScore[neighbor] = tentGScore + heur(aIdx, neighbor);
        if(!openSet.has(neighbor)) openSet.add(neighbor);
      }
    })
  }
  return null;
}