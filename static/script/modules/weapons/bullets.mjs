import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import World from "../world.mjs";
import Entity from "../entity.mjs";
import { TILES, worldToTile } from "../world/map.mjs";

/**
 * @readonly
 * @enum {number}
 */
export const ProjectileType = {
  UNKNOWN: 0,
  PHYSICS: 1,
}

/**
 * @typedef BulletType
 * @type {object}
 * @prop {number?} id
 * @prop {string?} name
 * @prop {ProjectileType} type
 * @prop {PhysicsBulletParameters} params
 * @prop {Function?} onDeath
 */

/** 
 * @typedef PhysicsBulletParameters 
 * @type {object}
 * @prop {Vector} size
 * @prop {number} drag
 * @prop {number} restitution
 * @prop {number} trailLength
 * @prop {string} trailColor
*/

/**
 * @typedef Bullet
 * @type {object}
 * @prop {Vector} drawPos
 * @prop {Vector} pos
 * @prop {Vector} oldPos
 * @prop {Vector} vel
 * @prop {number} damage
 * @prop {number} life
 */

/** @type {{[name: string]: BulletType}} */
const bulletTypes = {};
const typeNames = [];
let bulletTypeCount = 0;


/**
 * Register a bullet type.
 * @param {BulletType} type 
 */
export const registerBulletType = (name, type) => {
  type.id = bulletTypeCount;
  type.name = name;
  bulletTypes[name] = type;
  typeNames.push(name);
  bulletsByType[type.id] = [];

  bulletTypeCount += 1;
}

/**
 * Bullets[bulletTypeID][i]
 * @type {Bullet[][]}
 */
const bulletsByType = [];

/**
 * 
 * @param {number} dt 
 * @param {World} world 
 */
export const physics = (dt, world) => {
  const dead = [];
  const rect = new Rect();
  for(let i = 0; i < bulletTypeCount; i++) {
    const type = bulletTypes[typeNames[i]];
    const bullets = bulletsByType[i];
    rect.width = type.params.size.x;
    rect.height = type.params.size.y;

    for(let j = 0; j < bullets.length; j++) {
      const b = bullets[j];
      if(!b) continue;
      if(b.life <= 0) {
        if(type.onDeath)
          type.onDeath(b);
        bullets[j] = null;
      }
      b.life -= dt;
      switch (type.type) {
        case ProjectileType.PHYSICS:
          b.oldPos = b.pos.clone();
          b.pos.add(Vector.mul(b.vel, dt));
          b.vel.mul(type.params.drag);
          rect.left = b.pos.x;
          rect.top = b.pos.y;

          if(b.oldPos != undefined) {
            for(let i = 0; i < world.entities.length; i++) {
              /** @type {Entity} */
              const ent = world.entities[i];
              if(!ent || ent.dead) continue;
              if(ent.virtualRect.lineIntersects(b.oldPos, b.pos)) {
                ent.onHit(b);
                b.life = 0;
              }
            }
            const hits = world.map.raycast(b.oldPos, b.pos, 1);
            if(hits.length > 0) {
              b.pos = hits[0];
              if(type.params.restitution > 0) {
                // not accurate
                b.vel = Vector.mul(b.vel, -type.params.restitution);
              } else b.life = 0;
            }
          }
        break;
        default:

        break;
      }
    }
  }
}
/**
 * 
 * @param {number} dt 
 * @param {CanvasRenderingContext2D} ctx 
 */
export const draw = (dt, ctx) => {
  for(let i = 0; i < bulletTypeCount; i++) {
    const type = bulletTypes[typeNames[i]];
    const bullets = bulletsByType[i];
    const w = type.params.size.x;
    const h = type.params.size.y;

    for(let j = 0; j < bullets.length; j++) {
      const b = bullets[j];
      if(!b) continue;
      switch (type.type) {
        case ProjectileType.PHYSICS:
          b.drawPos = Vector.lerp(b.drawPos, b.pos, 0.2);
          ctx.fillStyle = type.params.trailColor;
          ctx.fillRect(b.drawPos.x - w/2, b.drawPos.y - h/2, w, h);
          ctx.strokeStyle = type.params.trailColor;
          ctx.lineWidth = type.params.size.x;
          const trailPos = Vector.sub(b.drawPos, b.vel.normalized().mul(type.params.trailLength));
          ctx.beginPath();
          ctx.moveTo(b.drawPos.x, b.drawPos.y);
          ctx.lineTo(trailPos.x, trailPos.y);
          ctx.stroke()
        break;
        default:

        break;
      }
    }
  }
}

/**
 * 
 * @param {string} type Type of bullet
 * @param {Bullet} bullet
 */
export const createBullet = (type, bullet) => {
  if(bulletTypes[type] == undefined) return console.error("Bullet type", type, "not found!");
  bullet.drawPos = bullet.pos;
  bulletsByType[bulletTypes[type].id].push(bullet);
}