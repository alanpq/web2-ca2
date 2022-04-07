import { images } from "../images.mjs";
import Vector from "../math/vector.mjs";
import { TILES, worldToTile } from "../world/map.mjs";

const explosions = [];

const LIFETIME = .5;

/**
 * 
 * @param {Vector} pos 
 * @param {number} damage 
 * @param {World} world 
 */
export const explode = (pos, damage, world) => {
  explosions.push([pos, LIFETIME]);
  for(const e of world.entities.concat(world.player)) {
    if(!e) continue;
    const dir = Vector.sub(e.position, pos);
    let m = dir.sqrMagnitude;
    if(m > 14400) continue;
    const d = Math.sqrt(m);
    const v = dir.normalized().mul(70000).div(m);
    e.hurt(10)
    e.velocity.add(v);
    if(d < 70) e.hurt(10000);
  }
  const center = worldToTile(pos);
  const top    = center.y - 3;
  const bottom = center.y + 3;
  const left   = center.x - 3;
  const right  = center.x + 3;

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const p = new Vector(x,y); // in tile space
      const m = Vector.sub(center, p).sqrMagnitude;
      if (m <= 16) {
        const t = world.map.getTile(p);
        const prob = Math.pow(1 - (m / 16), 1);
        if(Math.random() <= prob) {
          switch (t) {
            case TILES.WALL:
              if(Math.random() <= prob)
                world.map.setTile(p, TILES.FLOOR);
              else
                world.map.setTile(p, TILES.DAMAGED_WALL);
            break;
            case TILES.FLOOR:
              if(Math.random() > prob)
                world.map.setTile(p, TILES.DAMAGED_FLOOR);
              else
            break;
          }
        }
      }
    }
  }
}

/**
* Render a frame.
* @param {number} dt
* @param {CanvasRenderingContext2D} ctx 
*/
export const render = (dt, ctx) => {
  for(let j = 0; j < explosions.length; j++) {
    const e = explosions[j];
    if(!e) continue;
    const i = 6 - Math.floor((e[1] / LIFETIME) * 6);
    ctx.drawImage(images["explosion.png"], i * 64, 0, 64, 64, e[0].x-128, e[0].y-128, 256, 256);
    e[1] -= dt;
    if(e[1] <= 0) delete explosions[j];
  }
}