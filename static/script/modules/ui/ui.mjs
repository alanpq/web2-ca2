// super basic ui inspired by imgui

// the ui stack holds the nested 'positioning contexts',
// which is used when rendering widgets to build 1 dimensional layouts

/**
 * @typedef SidedValues
 * @type {object}
 * @prop {number} top
 * @prop {number} right
 * @prop {number} bottom
 * @prop {number} left
 */

/**
 * @typedef PositioningContext
 * @type {object}
 * @prop {boolean} horizontal Whether the context lays out horizontally.
 * @prop {number} width Current width of the context
 * @prop {number} height Current height of the context
 * @prop {number} x Inherited x of the context
 * @prop {number} y Inherited y of the context
 */

export default class UI {
  /**
   * @type {PositioningContext[]}
   */
  posStack = [];
  /** @type {CanvasRenderingContext2D} */
  ctx;

  /** @type {SidedValues} */
  textPadding = {top: 2, right: 2, bottom: 2, left: 2};

  /**
 * @typedef Font
 * @type {object}
 * @prop {number} size Font size
 * @prop {string} unit Font unit (px, em, etc)
 * @prop {string} family Font family
 * @prop {string} color Font color
 */
  /** @type {Font} */
  font = {
    size: 12,
    unit: "px",
    family: "",
    color: "white",
  };
  get fontString () {
    return `${font.size}${font.unit} ${font.family}`;
  }

  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} text 
   */
  text(text) {
    //TODO: multiline text
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px monospace";
    const pctx = this.top();
    const metrics = this.ctx.measureText(text);
    const w = metrics.width + textPadding.left + textPadding.right;
    const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
              + textPadding.top + textPadding.bottom;
    if(pctx.horizontal) { // horizontal flow
      this.ctx.fillText(text, pctx.x + pctx.width + textPadding.left, pctx.y + textPadding.top);
      pctx.width += w;
      pctx.height = Math.max(pctx.height, h);
    } else { // vertical flow
      if(pctx.height == 0) pctx.height = h;
      this.ctx.fillText(text, pctx.x + textPadding.left, pctx.y + pctx.height + textPadding.top);
      pctx.width = Math.max(pctx.width, w);
      pctx.height += h;
    }
  }

  startVertical() {
    const pctx = top();
    posStack.push({
      horizontal: false,
      width: 0,
      height: 0,
      x: pctx.x + pctx.width * pctx.horizontal,
      y: pctx.y + pctx.height * !pctx.horizontal,
    })
  }

  startHorizontal() {
    const pctx = top();
    posStack.push({
      horizontal: true,
      width: 0,
      height: 0,
      x: pctx.x + pctx.width * pctx.horizontal,
      y: pctx.y + pctx.height * !pctx.horizontal,
    })
  }
  // TODO: max depth on queue to prevent memory leak if you forget an end call
  endVertical() {
    const old = posStack.pop();
    if(old.horizontal)
      throw new Error("Unmatched horizontal flow! Tried to end vertical when a horizontal has not yet been closed.")
    const n = top();
    n.x += old.width;
    n.y += old.height;
  }
  
  endHorizontal() {
    const old = posStack.pop();
    if(!old.horizontal)
      throw new Error("Unmatched vertical flow! Tried to end horizontal when a vertical has not yet been closed.")
    const n = top();
    n.height += old.height;
  }

  /**
   * Get top of the positioning stack.
   * @returns {PositioningContext}
   */
  top() {
    if(posStack.length == 0) {
      return {
        horizontal: false,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      }
    }
    return posStack[posStack.length-1];
  }
}

