'use strict';
import Vector from "../math/vector.mjs";
import * as input from "../input/mod.mjs";
import { PHYSICS_INTER, PLAYER_HEALTH } from "../constants.mjs";
import { Flags, registerDebug } from "../ui/debug.mjs";

import * as debug from './debug.mjs';
import Rect from "../math/rect.mjs";
import Entity from "../entity.mjs";
import World from "../world.mjs";
import Sprite from "../images.mjs";
import { angleLerp, lerp } from "../math/mod.mjs";

export const PLAYER_SIZE = 20;
export const PLAYER_SIZE_HALF = PLAYER_SIZE/2;

/**
 * @typedef PlayerDebug
 * @prop {Vector} tangent
 * @prop {Vector} hit
 * @prop {Vector} tile
 * @prop {Vector} dir
 */

export default class Player extends Entity {

  #body = new Sprite("body.png")
  #head = new Sprite("head.png")

  constructor (position) {
    super(position, new Vector(PLAYER_SIZE, PLAYER_SIZE), PLAYER_HEALTH);
    this.speed = 200;
    registerDebug(Flags.PLAYER, "draw", debug.draw.bind(this, this, this.#debug));
    registerDebug(Flags.PLAYER, "ui", debug.ui.bind(this, this, this.#debug));
  }

  /** @type {PlayerDebug} */
  #debug = {};

  #facing = 0;
  #facingLerp = 0;

  tick(dt) {
    super.tick(dt);
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt, world) {
    if(this.dead) return super.physics(dt, world);
    this.input = new Vector(input.axis("horizontal"), -input.axis("vertical")).normalized();
    const inputDir = this.input.clone().mul(dt * this.speed);
    this.velocity.add(inputDir);
    super.physics(dt, world);
    const v = Vector.sub(world.camera.screenToWorld(input.mouse()), this.position).normalized();
    this.#facing = Math.atan2(v.y, v.x);
  }
  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "white";
    if(this.#facing)
      this.#body.draw(ctx, this.virtualPosition, this.#facing, new Vector(7,7));
    this.#head.draw(ctx, this.virtualPosition, this.#facingLerp, new Vector(5,5));
    this.#facingLerp = angleLerp(this.#facingLerp, this.#facing, 20*dt);
    if(!this.dead) {
      const ww = (this.rect.width*1.5);
      const w = ww * (this.health/this.maxHealth);
      ctx.fillStyle = "red";
      ctx.fillRect(this.virtualPosition.x - (ww)/2, this.virtualPosition.y - this.rect.height*1.1, ww, 5);
      ctx.fillStyle = "green";
      ctx.fillRect(this.virtualPosition.x - (ww)/2, this.virtualPosition.y - this.rect.height*1.1, w, 5);
    }
  }
}