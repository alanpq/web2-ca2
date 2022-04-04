import Rect from "../math/rect.mjs"
import Vector from "../math/vector.mjs";

import * as input from '../input/mod.mjs';

const square = new Rect(100, 100, 20, 20);
let a = new Vector();
let b = new Vector();

export const tick = (dt) => {
  if(input.leftMouseDown()) {
    if(!input.button("up")) {
      a = input.mouse().clone();
    } else {
      square.left = input.mouse().x;
      square.top = input.mouse().y;
    }
  }

  if(input.rightMouseDown()) {
    if(!input.button("up")) {
      b = input.mouse().clone();
    } else {
      square.width = input.mouse().x - square.left;
      square.height = input.mouse().y - square.top;
    }
  }
}

/**
 * 
 * @param {Enemy} enemy 
 * @param {number} dt 
 * @param {CanvasRenderingContext2D} ctx 
 */
export const draw = (dt, ctx) => {
  ctx.save();
  ctx.resetTransform();

  ctx.fillStyle = "pink";
  ctx.fillRect(a.x, a.y, 10, 10);
  ctx.fillStyle = "green";
  ctx.fillRect(b.x, b.y, 10, 10);
  ctx.strokeStyle = square.lineIntersects(a,b) ? "blue" : "orange";
  ctx.strokeRect(square.left, square.top, square.width, square.height);

  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);

  ctx.stroke();



  ctx.restore();
}