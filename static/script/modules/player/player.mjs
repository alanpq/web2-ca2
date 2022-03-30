'use strict';
import Vector from "../math/vector.mjs";
import * as input from "../input/mod.mjs";
import { PHYSICS_INTER } from "../constants.mjs";
import { Flags, registerDebug } from "../ui/debug.mjs";

import * as debug from './debug.mjs';
import { TILE_SIZE, World, worldToTile } from "../world.mjs";
import Rect from "../math/rect.mjs";

export const PLAYER_SIZE = 20;
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

const SUBSTEPS = 10;

export default class Player {
  #virtualPos = new Vector(); // virtual position for interpolation
  #position = new Vector();
  #velocity = new Vector();
  /** @type {World} */
  #world;
  /** @type {Rect} */
  #rect = new Rect(0,0,PLAYER_SIZE,PLAYER_SIZE);
  constructor (world) {
    this.#world = world;
    registerDebug(Flags.PLAYER, "draw", debug.draw.bind(this, this, this.#debug));
    registerDebug(Flags.PLAYER, "ui", debug.ui.bind(this, this, this.#debug));
  }

  get position (){return this.#position;}
  get velocity (){return this.#velocity;}


  
  /** @type {PlayerDebug} */
  #debug = {};

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   */
  physics(dt) {
    let inputDir = new Vector(input.axis("horizontal"), -input.axis("vertical")).mul(dt * 100);
    this.#velocity.add(inputDir).mul(0.5);
    // naive, needs substeppage to feel tight
    for(let i = 0; i < SUBSTEPS; i++) {
      const newPos = Vector.add(this.#position, this.#velocity.clone().div(SUBSTEPS));
      this.#rect.top = this.#position.y;
      this.#rect.left = newPos.x;
      let hit = this.#world.tileCollides(this.#rect);
      if(hit) {
        newPos.x = this.#position.x;
        this.#rect.left = this.#position.x;
      }
      this.#rect.top = newPos.y;
      hit = this.#world.tileCollides(this.#rect);
      if(hit) {
        newPos.y = this.#position.y;
      }
      this.#position = newPos;
    }

    
    /*
      speed = joystick_speed()
      old_position = girl.position
      girl.position.x = girl.position.x + speed.x
      collided = tilemap_collision(tilemap, girl.rectangle)
      if(collided)
      {
        girl.position = old_position
      }
      old_position = girl.position
      girl.position.y = girl.position.y + speed.y
      collided = tilemap_collision(tilemap, girl.rectangle)
      if(collided)
      {
        girl.position = old_position
      }
    */
  }

  /**
   * Render the player.
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "white";
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.#position, 0.2);
    ctx.fillRect(this.#virtualPos.x, this.#virtualPos.y, PLAYER_SIZE, PLAYER_SIZE);
  }
}