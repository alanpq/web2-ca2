export default class Renderer {
  /** @type {HTMLCanvasElement} */
  #canvas;

  #w;
  #h;
  
  
  /** @type {CanvasRenderingContext2D} */
  ctx;

  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.#canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.#w = canvas.width;
    this.#h = canvas.height;

    window.addEventListener("resize", () => {
      this.conformToParent();
    });
    this.conformToParent();

  }
  
  conformToParent() {
    let h = this.#canvas.parentElement.clientHeight - 30;
    let w = h * 1.77777;
    const ww = window.innerWidth;
    const left = this.#canvas.offsetLeft;
    if(w > window.innerWidth - (left * 2) + 2) {
      w = this.#canvas.parentElement.clientWidth;
      h = w * 0.5625;
    }
    // TODO: this will not work if w < h
    this.setSize(w, h); // 16:9 ratio
  }

  setSize(width, height) {
    this.#w = width || this.#w;
    this.#h = height || this.#h;
    this.#canvas.width = this.#w;
    this.#canvas.height = this.#h;
  }

  get w() {
    return this.#w;
  }
  get h() {
    return this.#h;
  }
}