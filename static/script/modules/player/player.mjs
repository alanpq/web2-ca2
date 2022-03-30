'use strict';
import Vector from "../math/vector.mjs";
import * as input from "../input/mod.mjs";
import { PHYSICS_INTER } from "../constants.mjs";
import { Flags, registerDebug } from "../ui/debug.mjs";

import * as debug from './debug.mjs';
import { TILE_SIZE, World, worldToTile } from "../world.mjs";
import Rect from "../math/rect.mjs";
import Entity from "../entity.mjs";

export const PLAYER_SIZE = 20;
export const PLAYER_SIZE_HALF = PLAYER_SIZE/2;
/**
 * @typedef PlayerDebug
 * @prop {Vector} tangent
 * @prop {Vector} hit
 * @prop {Vector} tile
 * @prop {Vector} dir
 */

const directions = [
  Vector.right, Vector.up, Vector.left, Vector.down
]

/**
 * 
 * @param {Vector} vec
 * @returns 
 */
const snap = (vec) => {
  const angle = Math.atan2( vec.y, vec.x );
  const axis = (4 + Math.round(2*angle / Math.PI)) % 4;
  console.log(angle, Math.PI*2, axis);
  return directions[axis];
  // float x = Abs(direction.x);
  // float y = Abs(direction.y);
  // float z = Abs(direction.z);
  // if (x > y && x > z){
  //     return Vector3(Sign(direction.x),0,0);
  // } else if (y > x && y > z){
  //     return Vector3(0,Sign(direction.y),0);
  // } else {
  //     return Vector3(0,0,Sign(direction.z));
  // }

}


export default class Player extends Entity {

  constructor (world, position) {
    super(world, position, new Vector(PLAYER_SIZE, PLAYER_SIZE));
    this.speed = 100;
    registerDebug(Flags.PLAYER, "draw", debug.draw.bind(this, this, this.#debug));
    registerDebug(Flags.PLAYER, "ui", debug.ui.bind(this, this, this.#debug));
  }


  
  /** @type {PlayerDebug} */
  #debug = {};

  physics(dt) {
    this.input = new Vector(input.axis("horizontal"), -input.axis("vertical"));
    super.physics(dt);
  }

  render(dt, ctx) {
    super.render(dt, ctx);
  }
}