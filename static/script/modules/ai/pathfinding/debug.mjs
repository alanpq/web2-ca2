'use strict';
import * as input from '../../input/mod.mjs';
import { Dict2D } from '../../lib/Dict2d.mjs';
import Vector from '../../math/vector.mjs';
import World from '../../world.mjs';
import { CHUNK_WORLD_SIZE, TILE_SIZE, worldToTile } from '../../world/map.mjs';
import {findPath, idxToPos } from './pathfinding.mjs';

export const state = {
  order: new Dict2D(),
  i: 0,
  cameFrom: new Dict2D(),
  gScore: new Dict2D(),
  fScore: new Dict2D(),
  a: null,
  b: null,
  /** @type {World} */
  world: null,
  renderer: null,
}

export const tick = (dt) => {
  if(input.leftMouseDown()) {
    state.a = state.world.map.probeTile(worldToTile(state.renderer.camera.screenToWorld(input.mouse())));
    if(state.b) findPath(state.world, state.a, state.b, true).then(p => {state.path = p});
    console.log(state);
  }

  if(input.rightMouseDown()) {
    state.b = state.world.map.probeTile(worldToTile(state.renderer.camera.screenToWorld(input.mouse())));
    if(state.a) findPath(state.world, state.a, state.b, true).then(p => {state.path = p});
    console.log(state);
  }
}

export const draw = (dt, ctx) => {
  const off = new Vector(0.5, 0.5);
  if(state.order) {
    state.order.entries().forEach(([k,v]) => {
      const aa = k.clone().mul(TILE_SIZE);
      ctx.fillStyle = `rgba(255, ${Math.floor((1 - (v / state.i))*255)}, 0, .2)`; // 0 - 140
      ctx.fillRect(aa.x, aa.y, TILE_SIZE, TILE_SIZE);
    });
  }
  if(state.gScore) {
    state.gScore.entries().forEach(([k,v]) => {
      const aa = k.clone().mul(TILE_SIZE);
      ctx.font = "10px monospace";
      ctx.fillStyle = "black"; // 0 - 140
      ctx.fillText(v, aa.x, aa.y+10);
    });
  }
  if(state.fScore) {
    state.fScore.entries().forEach(([k,v]) => {
      const aa = k.clone().mul(TILE_SIZE);
      ctx.font = "10px monospace";
      ctx.fillStyle = "gray"; // 0 - 140
      ctx.fillText(v, aa.x, aa.y+TILE_SIZE-2);
    });
  }
  if(state.cameFrom) {
    state.cameFrom.entries().forEach(([k, v]) => {
      if(v == null) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      const aa = k.clone().add(off).mul(TILE_SIZE);
      const bb = v.clone().add(off).mul(TILE_SIZE);
      ctx.moveTo(aa.x, aa.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.stroke();
    });
  }
  if(state.path) {
    for(let i = state.path.length-1; i >= 1; i--) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "green";
      ctx.beginPath();
      const aa = state.path[i].clone().add(off).mul(TILE_SIZE);
      const bb = state.path[i-1].clone().add(off).mul(TILE_SIZE);
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

  const t = state.world.map.probeTile(worldToTile(state.renderer.camera.screenToWorld(input.mouse())));
  if(t && !input.isMouseEaten()) {
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(t.worldX*TILE_SIZE, t.worldY*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "black";
    ctx.fillText(`${t.worldX}, ${t.worldY}`, t.worldX*TILE_SIZE, t.worldY*TILE_SIZE - 30)
    ctx.fillText(`${t.x}, ${t.y}`,t.worldX*TILE_SIZE, t.worldY*TILE_SIZE - 20)
    ctx.fillText(t.tile, t.worldX*TILE_SIZE, t.worldY*TILE_SIZE - 10)

    if(t.chunk) {
      const x = t.chunk.x*CHUNK_WORLD_SIZE;
      const y = t.chunk.y*CHUNK_WORLD_SIZE;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(x, y, CHUNK_WORLD_SIZE, CHUNK_WORLD_SIZE);
    }
  }
}