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

export default class Player extends Entity {

  constructor (world, position) {
    super(world, position, new Vector(PLAYER_SIZE, PLAYER_SIZE));
    this.speed = 100;
    registerDebug(Flags.PLAYER, "draw", debug.draw.bind(this, this, this.#debug));
    registerDebug(Flags.PLAYER, "ui", debug.ui.bind(this, this, this.#debug));
  }

  /** @type {PlayerDebug} */
  #debug = {};

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   */
  physics(dt) {
    this.input = new Vector(input.axis("horizontal"), -input.axis("vertical"));
    super.physics(dt);
  }
  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillStyle = "white";
    super.render(dt, ctx);
  }
}