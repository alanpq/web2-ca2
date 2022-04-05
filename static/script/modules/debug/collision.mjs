import Rect from "../math/rect.mjs"
import Vector from "../math/vector.mjs";

import * as input from '../input/mod.mjs';
import World from "../world.mjs";

const square = new Rect(100, 100, 20, 20);
let a = new Vector();
let b = new Vector();

let hits = [];

let p = new Vector();
let c = new Vector();

export const tick = (dt) => {
  // if(input.leftMouseDown()) {
  //   if(!input.button("up")) {
  //     a = input.mouse().clone();
  //   } else {
  //     square.left = input.mouse().x;
  //     square.top = input.mouse().y;
  //   }
  // }

  // if(input.rightMouseDown()) {
  //   if(!input.button("up")) {
  //     b = input.mouse().clone();
  //   } else {
  //     square.width = input.mouse().x - square.left;
  //     square.height = input.mouse().y - square.top;
  //   }
  // }
}

/**
 * Do a fixed rate physics tick.
 * @param {number} dt
 * @param {World} world
 */
export const physics = (dt, world) => {
  c = world.camera.screenToWorld(input.mouse());
  p = world.player.position;
  hits = world.map.raycast(world.player.position, c, 1);
}

/**
 * 
 * @param {Enemy} enemy 
 * @param {number} dt 
 * @param {CanvasRenderingContext2D} ctx 
 */
export const draw = (dt, ctx) => {
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(c.x, c.y);
  ctx.stroke();
  if(hits) {
    ctx.fillStyle = "red";
    for(const h of hits) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, 3, 0, Math.PI*2);
      ctx.fill();
    } 
  }
  // ctx.save();
  // ctx.resetTransform();

  // ctx.fillStyle = "pink";
  // ctx.fillRect(a.x, a.y, 10, 10);
  // ctx.fillStyle = "green";
  // ctx.fillRect(b.x, b.y, 10, 10);
  // ctx.strokeStyle = square.lineIntersects(a,b) ? "blue" : "orange";
  // ctx.strokeRect(square.left, square.top, square.width, square.height);

  // ctx.beginPath();

  // ctx.moveTo(a.x, a.y);
  // ctx.lineTo(b.x, b.y);

  // ctx.stroke();

  // ctx.restore();

  
}