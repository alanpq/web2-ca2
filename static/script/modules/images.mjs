import Vector from "./math/vector.mjs";

/** @type {Sprite[]} */
const sprites = [];
const images = {};

export const loadImage = (src) => {
  if(images[src] !== undefined) return Promise.resolve(images[src]);
  const image = new Image();
  image.src = URL_BASE + '/static/image/' + src;
  console.log(`Loading image '${image.src}'...`)
  images[src] = image;
  return new Promise((res, rej) => {
    image.addEventListener("load", (e) => {
      res(image);
    }, false);
    image.addEventListener("error", (e) => {
      console.error(e);
      rej(e);
    }, false);
  })
}

export default class Sprite {
  src;
  /** @type {HTMLImageElement} */
  #image;
  #loaded = false;
  #spritesheet = {
    interval: 0,
    tileSize: 0,
    cols: 0,
  };
  #time = 0;
  constructor(src, spritesheet=null) {
    this.src = src;
    sprites.push(this)
    this.#spritesheet = spritesheet;
    this.load();
  }

  tick(dt) {
    this.#time += dt;
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
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rot);
    if(this.#spritesheet) {
      const x = Math.floor(this.#time/this.#spritesheet.interval) % this.#spritesheet.cols;
      ctx.drawImage(this.#image, this.#spritesheet.tileSize*x, 0, this.#spritesheet.tileSize, this.#spritesheet.tileSize, -axis.x, -axis.y, this.#spritesheet.tileSize, this.#spritesheet.tileSize);
    } else
      ctx.drawImage(this.#image, -axis.x, -axis.y);
    ctx.restore();
  }

  async load() {
    this.#image = await loadImage(this.src);
    this.#loaded = true;
  }
}