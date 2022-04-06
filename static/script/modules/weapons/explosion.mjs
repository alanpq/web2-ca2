import { images } from "../images.mjs";

const explosions = [];

const LIFETIME = .5;

export const explode = (pos, damage) => {
  explosions.push([pos, LIFETIME]);
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
    console.log(i);
    ctx.drawImage(images["explosion.png"], i * 64, 0, 64, 64, e[0].x-64, e[0].y-64, 128, 128);
    e[1] -= dt;
    if(e[1] <= 0) delete explosions[j];
  }
}