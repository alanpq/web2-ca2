import Vector from "../math/vector.mjs"
import { CHUNK_AREA, CHUNK_SIZE, TILES, World } from "../world.mjs"

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

const constructPath = (cameFrom, cur) => {
  const path = [cur];
  let c = cur + 0;
  while (cameFrom[c] != undefined) {
    c = cameFrom[c];
    path.push(c)
  }
  return path;
}

// manhatten distance
// TODO: investigate octile distance
const dist = (a, b) => {
  const aa = idxToPos(a);
  const bb = idxToPos(b);
  return Math.abs(aa.x-bb.x) + Math.abs(aa.y-bb.y);
}

export const debug = {
  order: {},
  i: 0,
  cameFrom: {},
  gScore: {},
  fScore: {},
}

export const drawDebug = (ctx) => {

}

// a* implemented with the help of https://en.wikipedia.org/wiki/A*_search_algorithm
/**
 * Find the shortest path between two tiles.
 * @param {World} world
 * @param {import("../world.mjs").DetailedTile} a 
 * @param {import("../world.mjs").DetailedTile} b 
 */
export const findPath = (world, a, b) => {
  // FIXME: implement cross-chunk pathing
  // TODO: do bi-directional pathing to exit impossible paths earlier
  if(a.chunk != b.chunk) return console.error("Pathfinding does not yet work across chunks!");
  if(b.tile != TILES.FLOOR) return null;
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

  debug.i = 0;
  debug.order = {};

  const neighborsOf = (tile) => {
    if(tile < 0 || tile >= CHUNK_AREA) return;
    // FIXME: implement
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
    console.debug(set, minN)
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
    debug.cameFrom = cameFrom;
    debug.fScore = fScore;
    debug.gScore = gScore;
    if (cur == bIdx) return constructPath(cameFrom, cur);

    openSet.delete(cur);
    
    const neighbors = neighborsOf(cur, openSet);
    neighbors.forEach(neighbor => {
      const tentGScore = gScore[cur] + 1;//dist(cur, neighbor);
      if (gScore[neighbor] == undefined || tentGScore < gScore[neighbor] ) {
        if(!debug.order[neighbor])
          debug.order[neighbor] = debug.i;
        debug.i += 1;
        cameFrom[neighbor] = cur;
        gScore[neighbor] = tentGScore;
        fScore[neighbor] = tentGScore + dist(neighbor, bIdx);
        openSet.add(neighbor);
      }
    })
  }
  debug.cameFrom = cameFrom;
  debug.fScore = fScore;
  debug.gScore = gScore;
  return null;
}