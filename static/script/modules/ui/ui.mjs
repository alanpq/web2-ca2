// super basic ui inspired by imgui

import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import * as input from '../input/mod.mjs';

// the ui stack holds the nested 'positioning contexts',
// which is used when rendering widgets to build 1 dimensional layouts

// when a widget is rendered, it expands the positioning context in the direction of flow (ie. horizontally/vertically)

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

/**
 * 
 * @param {PositioningContext} ctx The positioning context
 * @param {Rect} rect The widget's bounding box.
 */
const expandPositioningContext = (ctx, rect) => { 
  if(ctx.horizontal) { // horizontal flow
    ctx.width += rect.width;
    ctx.height = Math.max(ctx.height, rect.height);
  } else { // vertical flow
    ctx.width = Math.max(ctx.width, rect.width);
    ctx.height += rect.height;
  }
}

/**
 * Compute a new widget rect that fits in the parent positioning context.
 * @param {PositioningContext} parent 
 * @param {number} width width of the widget 
 * @param {number} height height of the widget 
 */
const computeWidgetRect = (parent, width=0, height=0) => {
  return new Rect(
    parent.x + (parent.width * parent.horizontal),
    parent.y + (parent.height * !parent.horizontal),
    width, height);
}

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

  //** Set appropriate canvas properties for text rendering. */
  #prepareFont() {
    this.ctx.fillStyle = this.font.color;
    this.ctx.font = this.fontString;
  }

  /**
   * Draw a line of text.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} text 
   */
  text(text) {
    //TODO: multiline text
    const parent = this.top();
    const mText = this.ctx.measureText(text);
    const rect = computeWidgetRect(parent,
      mText.width + this.textPadding.left + this.textPadding.right,
      mText.actualBoundingBoxAscent + mText.actualBoundingBoxDescent + this.textPadding.top + this.textPadding.bottom,
    );
    this.#prepareFont();
    this.ctx.fillText(text, rect.left + this.textPadding.left, rect.top + mText.actualBoundingBoxAscent + this.textPadding.top);
    expandPositioningContext(parent, rect);
  }

  /**
   * Draw a checkbox.
   * @param {boolean} value Whether the checkbox is checked
   * @param {string} label The text label
   * @returns {boolean}
   */
  checkbox(value, label) {
    const parent = this.top();
    const mText = this.ctx.measureText(label);
    const rect = computeWidgetRect(parent,
      this.font.size + 5 + mText.width,
      this.font.size * 1.1,
    );
    const hit = rect.containsPoint(input.mouse());
    input.setMouseEat(hit);
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

    this.#prepareFont();
    this.ctx.fillText(label, rect.left + this.font.size * 1.4, rect.top + mText.actualBoundingBoxAscent);

    expandPositioningContext(parent, rect);
    return value ^ (hit && input.leftMouseDown(true));
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

