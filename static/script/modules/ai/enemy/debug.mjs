'use strict';

import Vector from "../../math/vector.mjs";
import { TILE_SIZE } from "../../world/map.mjs";
import { idxToPos } from "../pathfinding/pathfinding.mjs";
import Enemy from "./enemy.mjs";

export const tick = (dt) => {

}

/**
 * 
 * @param {Enemy} enemy 
 * @param {number} dt 
 * @param {CanvasRenderingContext2D} ctx 
 */
export const draw = (state, dt, ctx) => {
  ctx.fillText(state.enemy.velocity.toString(3), state.enemy.position.x, state.enemy.position.y-20);
  ctx.fillText(state.enemy.position.toString(3), state.enemy.position.x, state.enemy.position.y-10);
  ctx.fillText(state.debug.d, state.enemy.position.x, state.enemy.position.y);
  if(state.debug.tile) {
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.fillRect(state.debug.tile.worldX*TILE_SIZE, state.debug.tile.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  if(state.debug.targetDir && state.debug.targetDir.sqrMagnitude > 0) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(state.enemy.position.x, state.enemy.position.y);
    ctx.lineTo(state.debug.targetDir.x + state.enemy.position.x, state.debug.targetDir.y + state.enemy.position.y);
    ctx.stroke();
  }


  if(state.debug.target) {
    ctx.fillStyle = "red";
    ctx.fillRect(state.debug.target.x, state.debug.target.y, 5, 5);
  }



  if(!state.enemy.path || !state.debug.tile.chunk) return;
  const off = new Vector(state.debug.tile.chunk.x + 0.5, state.debug.tile.chunk.y + 0.5);
  for(let i = state.enemy.path.length-1; i >= 1; i--) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    const aa = idxToPos(state.enemy.path[i]).add(off).mul(TILE_SIZE);
    const bb = idxToPos(state.enemy.path[i-1]).add(off).mul(TILE_SIZE);
    ctx.moveTo(aa.x, aa.y);
    ctx.lineTo(bb.x, bb.y);
    ctx.stroke();

    if(state.debug.curIdx == state.enemy.path.length - (i+1)) {
      ctx.fillStyle = "orange";
      ctx.fillRect(bb.x, bb.y, 5, 5);
    }
  }
}