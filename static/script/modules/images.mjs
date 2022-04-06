import Vector from "./math/vector.mjs";

/** @type {Sprite[]} */
const sprites = [];

export const loadAllImages = () => {
  return Promise.allSettled(sprites.map(spr => spr.load()));
}

export default class Sprite {
  src;
  /** @type {HTMLImageElement} */
  #image;
  #loaded = false;
  constructor(src) {
    this.src = src;
    sprites.push(this);
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Vector} pos 
   * @param {number} rot 
   * @param {Vector} axis 
   */
  draw(ctx, pos, rot=0, axis=Vector.zero) {
    if(!this.#loaded) return;
    ctx.save();
    const t = ctx.getTransform();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rot);
    ctx.drawImage(this.#image, -axis.x, -axis.y);
    ctx.restore();
  }

  async load() {
    this.#image = new Image();
    this.#image.src = URL_BASE + '/static/image/' + this.src;
    console.log(`Loading image '${this.#image.src}'...`)
    return new Promise((res, rej) => {
      this.#image.addEventListener("load", (e) => {
        res();
        this.#loaded = true;
      }, false);
      this.#image.addEventListener("error", (e) => {
        console.error(e);
        rej(e);
      }, false);
    })
  }
}