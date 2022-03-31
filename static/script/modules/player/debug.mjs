'use strict';
import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import UI from "../ui/ui.mjs";
import Player, { PLAYER_SIZE } from "./player.mjs";
import * as input from '../input/mod.mjs';
import { Align } from "../ui/positioningContext.mjs";
import { TILE_SIZE } from "../world/map.mjs";

/**
 * @param {Player} p
 * @param {import("./player.mjs").PlayerDebug} debug
 * @param {number} dt 
 * @param {UI} ui 
 */
export const ui = (p, debug, dt, ui) => {
  ui.startArea(new Rect(ui.ctx.canvas.width-500,0, 500, 500), Align.END);
  ui.startVertical();
  ui.text(`(${input.axis("horizontal")}, ${-input.axis("vertical")}): input`);
  ui.endVertical();
  ui.endArea();
}

/**
 * @param {Player} p
 * @param {import("./player.mjs").PlayerDebug} debug
 * @param {number} dt 
 * @param {CanvasRenderingContext2D} ctx 
 */
export const draw = (p, debug, dt, ctx) => {
  ctx.fillStyle = "rgba(255,100,0,0.2)";
  if(debug.hit)
    ctx.fillRect(debug.hit.x * TILE_SIZE, debug.hit.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "rgba(255,255,0,0.2)";
  if(debug.tile)
    ctx.fillRect(debug.tile.x * TILE_SIZE, debug.tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  ctx.strokeStyle = "green";
  if(debug.tangent) {
    ctx.beginPath()
    ctx.moveTo(p.position.x, p.position.y);
    ctx.lineTo(p.position.x + debug.tangent.x*TILE_SIZE*1.1, p.position.y + debug.tangent.y*TILE_SIZE*1.1);
    ctx.stroke();
  }
  ctx.strokeStyle = "red";
  if(debug.dir) {
    ctx.beginPath()
    ctx.moveTo(p.position.x+PLAYER_SIZE/2, p.position.y+PLAYER_SIZE/2);
    ctx.lineTo(p.position.x+PLAYER_SIZE/2 + debug.dir.x*TILE_SIZE*1.1, p.position.y+PLAYER_SIZE/2 + debug.dir.y*TILE_SIZE*1.1);
    ctx.stroke();
  }
}