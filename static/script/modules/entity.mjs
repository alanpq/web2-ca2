'use strict';

import Rect from "./math/rect.mjs";
import Vector from "./math/vector.mjs";
import World from "./world.mjs";
import { CHUNK_SIZE, TILE_SIZE } from "./world/map.mjs";

const SUBSTEPS = 10;

export default class Entity {
  #virtualPos = new Vector(); // virtual position for interpolation
  position = new Vector();
  velocity = new Vector();
  /** @type {Rect} */
  #rect;

  input = new Vector();
  speed = 0;
  drag = 0.5;
  
  #maxHealth = 0;
  health = 0;

  
  get virtualPosition (){return this.#virtualPos;}
  get rect () {return new Rect(this.position.x-this.#rect.width/2, this.position.y-this.#rect.height/2, this.#rect.width, this.#rect.height);}
  get virtualRect() {return new Rect(this.#virtualPos.x-this.#rect.width/2, this.#virtualPos.y-this.#rect.height/2, this.#rect.width, this.#rect.height);}

  /**
   * 
   * @param {Vector} position 
   * @param {Vector} size 
   */
  constructor(position, size, maxHealth=0) {
    this.position = position;
    this.#virtualPos = position.clone();
    this.#rect = new Rect(0,0,size.x,size.y);
  
    this.#maxHealth = this.health = maxHealth;
  }
  
  get maxHealth() {return this.#maxHealth;}
  
  get dead() {return this.health <= 0;}

  /**
   * 
   * @param {import("./weapons/bullets.mjs").Bullet} bullet 
   */
  onHit(bullet) {
    this.hurt(bullet.damage);
    this.velocity.add(bullet.vel.clone().mul(0.05));
  }

  hurt(damage) {
    this.health -= damage;
  }

  onDead() {

  }

  /**
   * Do a tick.
   * @param {number} dt
   */
  tick(dt) {
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.position, 0.2);
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   * @param {World} world
   */
  physics(dt, world) {
    if(!this.dead) {
      for(let i = 0; i < world.entities.length; i++) {
        /** @type {Entity} */
        const ent = world.entities[i];
        if(!ent || ent.dead) continue;
        const dir = Vector.sub(this.position, ent.position);
        let m = dir.sqrMagnitude;
        if(m > 100000) continue;
        m = Math.sqrt(m);
        if(m < TILE_SIZE) {
          this.velocity.add(dir.normalized());
        }
      }
    }

    this.velocity.mul(this.drag);
    // naive, needs substeppage to feel tight
    for(let i = 0; i < SUBSTEPS; i++) {
      const newPos = Vector.add(this.position, this.velocity.clone().div(SUBSTEPS));
      this.#rect.top = this.position.y - this.#rect.height/2;
      this.#rect.left = newPos.x - this.#rect.width/2;
      let hit = world.map.tileCollides(this.#rect);
      if(hit) {
        newPos.x = this.position.x;
        this.velocity.x = 0;
        this.#rect.left = this.position.x - this.#rect.width/2;
      }
      this.#rect.top = newPos.y - this.#rect.height/2;
      hit = world.map.tileCollides(this.#rect);
      if(hit) {
        newPos.y = this.position.y;
        this.velocity.y = 0;
      }
      this.position = newPos;
    }

    
  }

  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    ctx.fillRect(this.#virtualPos.x-this.#rect.width/2, this.#virtualPos.y-this.#rect.height/2, this.#rect.width, this.#rect.height);
  }
}