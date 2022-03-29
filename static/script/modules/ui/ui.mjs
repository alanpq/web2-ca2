// super basic ui inspired by imgui

import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import * as input from '../input/mod.mjs';
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
    // TODO: cache this?
    return `${this.font.size}${this.font.unit} ${this.font.family}`;
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
    this.ctx.fillStyle = this.font.color;
    this.ctx.font = this.fontString;
    const pctx = this.top();
    const metrics = this.ctx.measureText(text);
    const w = metrics.width + this.textPadding.left + this.textPadding.right;
    const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
              + this.textPadding.top + this.textPadding.bottom;
    if(pctx.horizontal) { // horizontal flow
      this.ctx.fillText(text, pctx.x + pctx.width + this.textPadding.left, pctx.y + this.textPadding.top);
      pctx.width += w;
      pctx.height = Math.max(pctx.height, h);
    } else { // vertical flow
      if(pctx.height == 0) pctx.height = h;
      this.ctx.fillText(text, pctx.x + this.textPadding.left, pctx.y + pctx.height + this.textPadding.top);
      pctx.width = Math.max(pctx.width, w);
      pctx.height += h;
    }
  }

  /**
   * 
   * @param {boolean} value Whether the checkbox is checked
   * @param {string} label The text label
   * @returns {boolean}
   */
  checkbox(value, label) {
    const parent = this.top();
    const mText = this.ctx.measureText(label);
    const rect = new Rect(
      parent.x + (parent.width * parent.horizontal), parent.y + (parent.height * !parent.horizontal),
      this.font.size + 5 + mText.width,
      this.font.size * 1.1,
    );
    const hit = rect.containsPoint(input.mouse());
    this.ctx.fillStyle = hit ? "#C5C5C5": "#F3F3F3";
    this.ctx.strokeStyle = "#302f30";
    this.ctx.lineWidth = 0.5;
    const box = new Vector(rect.left + this.font.size * 0.1, rect.top);
    this.ctx.fillRect(box.x, box.y, this.font.size, this.font.size);
    this.ctx.strokeRect(box.x, box.y, this.font.size, this.font.size);
    if(value) {
      this.ctx.fillStyle = "#1B1B1B";
      const padding = this.font.size*0.25;
      this.ctx.fillRect(box.x+padding, box.y+padding, this.font.size-padding*2, this.font.size-padding*2);
    }
    this.ctx.fillStyle = this.font.color;
    this.ctx.font = this.fontString;
    this.ctx.fillText(label, rect.left + this.font.size * 1.4, rect.top + mText.actualBoundingBoxAscent)
    if(parent.horizontal) {
      parent.height = Math.max(parent.height, rect.height);
      parent.width += rect.width;
    } else {
      parent.width = Math.max(parent.width, rect.width);
      parent.height += rect.height;
    }
    return value ^ (hit && input.leftMouseDown());
  }

  startVertical() {
    const pctx = this.top();
    this.posStack.push({
      horizontal: false,
      width: 0,
      height: 0,
      x: pctx.x + pctx.width * pctx.horizontal,
      y: pctx.y + pctx.height * !pctx.horizontal,
    })
  }

  startHorizontal() {
    const pctx = this.top();
    this.posStack.push({
      horizontal: true,
      width: 0,
      height: 0,
      x: pctx.x + pctx.width * pctx.horizontal,
      y: pctx.y + pctx.height * !pctx.horizontal,
    })
  }
  // TODO: max depth on queue to prevent memory leak if you forget an end call
  endVertical() {
    const old = this.posStack.pop();
    if(old.horizontal)
      throw new Error("Unmatched horizontal flow! Tried to end vertical when a horizontal has not yet been closed.")
    const n = this.top();
    n.x += old.width;
    n.y += old.height;
  }
  
  endHorizontal() {
    const old = this.posStack.pop();
    if(!old.horizontal)
      throw new Error("Unmatched vertical flow! Tried to end horizontal when a vertical has not yet been closed.")
    const n = this.top();
    n.height += old.height;
  }

  /**
   * Get top of the positioning stack.
   * @returns {PositioningContext}
   */
  top() {
    if(this.posStack.length == 0) {
      return {
        horizontal: false,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      }
    }
    return this.posStack[this.posStack.length-1];
  }
}

