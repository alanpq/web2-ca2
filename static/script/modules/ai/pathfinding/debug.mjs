'use strict';
import * as input from '../../input/mod.mjs';
import Vector from '../../math/vector.mjs';
import World from '../../world.mjs';
import { TILE_SIZE } from '../../world/map.mjs';
import { findPath, idxToPos } from './pathfinding.mjs';

export const state = {
  order: {},
  i: 0,
  cameFrom: {},
  gScore: {},
  fScore: {},
  a: null,
  b: null,
  /** @type {World} */
  world: null,
  renderer: null,
}

export const tick = (dt) => {
  if(input.leftMouseDown()) {
    state.a = state.world.probeTileFromWorld(state.renderer.camera.screenToWorld(input.mouse()));
    if(state.b) state.path = findPath(state.world, state.a, state.b);
  }

  if(input.rightMouseDown()) {
    state.b = state.world.probeTileFromWorld(state.renderer.camera.screenToWorld(input.mouse()));
    if(state.a) state.path = findPath(state.world, state.a, state.b);
  }
}

export const draw = (dt, ctx) => {
  if(state.path) {
    const off = new Vector(state.a.chunk.x + 0.5, state.a.chunk.y + 0.5);
    Object.entries(state.order).forEach(([k,v]) => {
      const aa = idxToPos(k).mul(TILE_SIZE);
      const bb = idxToPos(v).mul(TILE_SIZE);
      ctx.fillStyle = `rgba(255, ${Math.floor((1 - (v / state.i))*255)}, 0, .2)`; // 0 - 140
      ctx.fillRect(aa.x, aa.y, TILE_SIZE, TILE_SIZE);
    });
    Object.entries(state.gScore).forEach(([k,v]) => {
      const aa = idxToPos(k).mul(TILE_SIZE);
      ctx.font = "10px monospace";
      ctx.fillStyle = "black"; // 0 - 140
      ctx.fillText(v, aa.x, aa.y+10);
    });
    Object.entries(state.fScore).forEach(([k,v]) => {
      const aa = idxToPos(k).mul(TILE_SIZE);
      ctx.font = "10px monospace";
      ctx.fillStyle = "gray"; // 0 - 140
      ctx.fillText(v, aa.x, aa.y+TILE_SIZE-2);
    });
    Object.entries(state.cameFrom).forEach(([k, v]) => {
      if(v == null) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      const aa = idxToPos(k).add(off).mul(TILE_SIZE);
      const bb = idxToPos(v).add(off).mul(TILE_SIZE);
      ctx.moveTo(aa.x, aa.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.stroke();
    });
    for(let i = state.path.length-1; i >= 1; i--) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "green";
      ctx.beginPath();
      const aa = idxToPos(state.path[i]).add(off).mul(TILE_SIZE);
      const bb = idxToPos(state.path[i-1]).add(off).mul(TILE_SIZE);
      ctx.moveTo(aa.x, aa.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.stroke();
    }
  }
  if(state.a) {
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.fillRect(state.a.worldX*TILE_SIZE, state.a.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  if(state.b) {
    ctx.fillStyle = "rgba(0,0,255,0.2)";
    ctx.fillRect(state.b.worldX*TILE_SIZE, state.b.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  const t = state.world.probeTileFromWorld(state.renderer.camera.screenToWorld(input.mouse()));
  if(t && !input.isMouseEaten()) {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(t.worldX*TILE_SIZE, t.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}