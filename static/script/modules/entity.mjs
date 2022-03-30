import Rect from "./math/rect.mjs";
import Vector from "./math/vector.mjs";

const SUBSTEPS = 10;

export default class Entity {
  #virtualPos = new Vector(); // virtual position for interpolation
  #position = new Vector();
  #velocity = new Vector();
  /** @type {World} */
  #world;
  /** @type {Rect} */
  #rect;

  input = new Vector();
  speed = 0;
  drag = 0.5;

  
  get virtualPosition (){return this.#virtualPos;}
  get position (){return this.#position;}
  get velocity (){return this.#velocity;}
  get world(){return this.#world;}

  /**
   * 
   * @param {World} world 
   * @param {Vector} position 
   * @param {Vector} size 
   */
  constructor(world, position, size) {
    this.#world = world;
    this.#position = position;
    this.#virtualPos = position;
    this.#rect = new Rect(0,0,size.x,size.y);
  }

  /**
   * Do a tick.
   * @param {number} dt
   */
  tick(dt) {
    
  }

  /**
   * Do a fixed rate physics tick.
   * @param {number} dt
   */
  physics(dt) {
    let inputDir = this.input.clone().mul(dt * this.speed);
    this.#velocity.add(inputDir).mul(this.drag);
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
  }

  /**
   * @param {number} dt Delta-time in seconds 
   * @param {CanvasRenderingContext2D} ctx 2D Context
   */
  render(dt, ctx) {
    this.#virtualPos = Vector.lerp(this.#virtualPos, this.#position, 0.2);
    ctx.fillRect(this.#virtualPos.x, this.#virtualPos.y, this.#rect.width, this.#rect.height);
  }
}