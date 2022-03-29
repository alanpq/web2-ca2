export default class Rect {
  #top;
  #left;
  #width;
  #height;
  constructor(left=0, top=0, width=0, height=0) {
    this.#top = top;
    this.#left = left;
    this.#width = width;
    this.#height = height;
  }

  get top() {return this.#top}
  get right() {return this.#left + this.#width}
  get bottom() {return this.#top + this.#height}
  get left() {return this.#left}
  get width() {return this.#width}
  get height() {return this.#height}
  area() {return this.#width * this.#height}

  /**
   * 
   * @param {Vector} p 
   * @returns {boolean}
   */
  containsPoint(p) {
    return (
      p.x >= this.left && p.x <= this.right &&
      p.y >= this.top && p.y <= this.bottom 
    );
  }
}