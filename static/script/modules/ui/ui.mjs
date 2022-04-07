'use strict';
// super basic ui inspired by imgui

import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";
import * as input from '../input/mod.mjs';
import PositioningContext, { Align, Flow } from "./positioningContext.mjs";
import { Flags, getFlag } from "./debug.mjs";

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
 * 
 * @param {string} str 
 */
const removeBackspaces = (s) => {
  let i = s.length-1;
  let copy = [];
  while(i>=0) {
    if(s[i] === '\b') {
      i-=2;
      continue;
    }
    copy.push(s[i]);
    i-=1;
  }
  return copy.reverse().join('');
}

export default class UI {
  /**
   * @type {PositioningContext[]}
   */
  stack = [];
  /** @type {CanvasRenderingContext2D} */
  ctx;

  /** @type {SidedValues} */
  textPadding = {top: 2, right: 2, bottom: 2, left: 2};

  hidden = false;

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
    family: "monospace",
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
  #drawBounds (widget, clip) {
    if(!getFlag(Flags.UI)) return;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(clip.left, clip.top, clip.width, clip.height);
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(widget.left, widget.top, widget.width, widget.height);
  }

  /**
   * Clip future render methods to the rect.
   * @param {Rect} rect 
   */
  #clipRect(rect) {
    this.ctx.beginPath();
    this.ctx.rect(rect.left, rect.top, rect.width, rect.height);
    this.ctx.clip();
  }

  space(amount=null) {
    const parent = this.top();
    const amt = amount || this.font.size;
    parent.expand(parent.computeClipRect(amt, amt));
  }

  /**
   * Draw a line of text.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} text 
   */
  text(text) {
    const parent = this.top();
    this.ctx.save();
    this.#prepareFont();
    //TODO: multiline text
    const mText = this.ctx.measureText(text);
    const rect = parent.computeWidgetRect( // TODO: think widget rect should be actual bounding box, clip rect should be its own thing
      mText.width + this.textPadding.left + this.textPadding.right,
      (mText.fontBoundingBoxDescent || mText.actualBoundingBoxDescent) + (mText.fontBoundingBoxAscent || mText.actualBoundingBoxAscent) + this.textPadding.top + this.textPadding.bottom,
    );
    if(!this.hidden) {
      const clipRect = parent.computeClipRect(rect.width, rect.height);
      this.#drawBounds(rect, clipRect);
      this.#clipRect(clipRect);
      this.ctx.fillText(
        text,
        rect.left + this.textPadding.left,
        rect.top + (mText.fontBoundingBoxAscent || mText.actualBoundingBoxAscent) + this.textPadding.top,
      );
    }
    parent.expand(rect);
    this.ctx.restore();
  }

  /**
   * Draw a checkbox.
   * @param {boolean} value Whether the checkbox is checked
   * @param {string} label The text label
   * @returns {boolean}
   */
  checkbox(value, label) {
    const parent = this.top();
    this.ctx.save();
    this.#prepareFont();
    
    const padding = this.font.size * 0.2;
    const mText = this.ctx.measureText(label);
    const rect = parent.computeWidgetRect(
      this.font.size + padding*3 + mText.width,
      this.font.size + padding*2,
    );
    let hit = false;
    if(!this.hidden) {
      const clipRect = parent.computeClipRect(rect.width, rect.height);
      this.#drawBounds(rect, clipRect);
      this.#clipRect(clipRect);
      hit = rect.containsPoint(input.mouse());
      input.setMouseEat(hit);

      this.ctx.fillStyle = hit ? "#C5C5C5": "#F3F3F3";
      this.ctx.strokeStyle = "#302f30";
      this.ctx.lineWidth = 0.5;

      const box = new Vector(rect.left + padding, rect.top + padding);
      this.ctx.fillRect  (box.x, box.y, this.font.size, this.font.size);
      this.ctx.strokeRect(box.x, box.y, this.font.size, this.font.size);

      if(value) {
        const tickPadding = this.font.size*0.25;
        this.ctx.fillStyle = "#1B1B1B";
        this.ctx.fillRect(box.x+tickPadding, box.y+tickPadding,
                          this.font.size-tickPadding*2, this.font.size-tickPadding*2);
      }

      this.ctx.fillStyle = this.font.color;
      this.ctx.fillText(
        label,
        box.x + this.font.size + padding,
        rect.top + mText.actualBoundingBoxAscent + padding,
      );
    }
    parent.expand(rect);
    this.ctx.restore();
    if (this.hidden) return value;
    return value ^ (hit && input.leftMouseDown(true));
  }
  #carat = 0; // FIXME: fix input() state
  #iSelected = false;
  #iSelectedAll = false;
  input(value, width=null) {
    const parent = this.top();
    this.ctx.save();
    this.#prepareFont();
    
    const mText = this.ctx.measureText(value);
    const rect = parent.computeWidgetRect(
      this.textPadding.left + this.textPadding.right + (width || mText.width),
      ((mText.fontBoundingBoxDescent + mText.fontBoundingBoxAscent) || this.font.size)  + this.textPadding.top + this.textPadding.bottom,
    );
    let hit = false;
    if(!this.hidden) {
      const clipRect = parent.computeClipRect(rect.width, rect.height);
      this.#drawBounds(rect, clipRect);
      this.#clipRect(clipRect);
      hit = rect.containsPoint(input.mouse());
      input.setMouseEat(hit);

      if(input.leftMouseDown(true)) {
        this.#iSelected = hit;
        this.#iSelectedAll = hit;
        input.rawFromQueue(); // clear input queue;
      }

      if(this.#iSelected) {
        const n = input.rawFromQueue();
        if(n.length > 0) {
          if(this.#iSelectedAll == true) value = "";
          this.#iSelectedAll = false;
        }
        value = removeBackspaces(value + n);
      }

      this.ctx.fillStyle = hit ? (input.leftMouse(true) ? "#9C9C9C" : "#C5C5C5"): "#F3F3F3";
      this.ctx.strokeStyle = "#302f30";
      this.ctx.lineWidth = 0.5;

      this.ctx.fillRect  (rect.left, rect.top, rect.width, rect.height);
      this.ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
      if(this.#iSelectedAll) {
        this.ctx.fillStyle = "#9AB9D6";
        this.ctx.fillRect  (rect.left + this.textPadding.left, rect.top + this.textPadding.top,
          mText.width, rect.height - (this.textPadding.top + this.textPadding.bottom));
      } else if(this.#iSelected) {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect  (mText.width + rect.left + this.textPadding.left+1, rect.top + this.textPadding.top,
          1, rect.height - (this.textPadding.top + this.textPadding.bottom));
      }

      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        value,
        rect.left + this.textPadding.left,
        rect.top + (mText.fontBoundingBoxAscent || mText.actualBoundingBoxAscent) + this.textPadding.top,
      );
    }
    parent.expand(rect);
    this.ctx.restore();
    return value;
  }

  button(label, width=null) {
    const parent = this.top();
    this.ctx.save();
    this.#prepareFont();
    
    const mText = this.ctx.measureText(label);
    const rect = parent.computeWidgetRect(
      this.textPadding.left + this.textPadding.right + (width || mText.width),
      mText.actualBoundingBoxAscent + mText.actualBoundingBoxDescent + this.textPadding.top + this.textPadding.bottom,
    );
    let hit = false;
    const clipRect = parent.computeClipRect(rect.width, rect.height);
    this.#drawBounds(rect, clipRect);
    this.#clipRect(clipRect);
    hit = rect.containsPoint(input.mouse());
    input.setMouseEat(hit);

    if(!this.hidden) {
      this.ctx.fillStyle = hit ? (input.leftMouse(true) ? "#818181" : "#C5C5C5"): "#F3F3F3";
      this.ctx.strokeStyle = "#302f30";
      this.ctx.lineWidth = 0.5;

      this.ctx.fillRect  (rect.left, rect.top, rect.width, rect.height);
      this.ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        label,
        rect.left + this.textPadding.left,
        rect.top + mText.actualBoundingBoxAscent + mText.actualBoundingBoxDescent + this.textPadding.top,
      );
    } 
    parent.expand(rect);
    this.ctx.restore();
    if (this.hidden) return false;
    return (hit && input.leftMouseDown(true));
  }

  /**
   * 
   * @param {Rect} rect 
   */
  startArea(rect, align=Align.START, justify=Align.START) {
    this.stack.push(PositioningContext.newArea(rect, align, justify));
  }

  endArea() {
    if(this.stack.length == 0) throw new Error("Trying to end area when nothing is open!");
    const old = this.stack.pop();
    if(!old.explicit)
      throw new Error("Tried to close area when another flow still open!");
  }

  startVertical(align=null, justify=null) {
    this.stack.push(PositioningContext.newFlow(Flow.VERTICAL, this.top(), align, justify));
  }

  startHorizontal(align=null, justify=null) {
    this.stack.push(PositioningContext.newFlow(Flow.HORIZONTAL, this.top(), align, justify));
  }
  // TODO: max depth on queue to prevent memory leak if you forget an end call
  endVertical() {
    const old = this.stack.pop();
    if(!old.vertical) {
      console.error(old);
      throw new Error("Unmatched flow! Tried to end vertical when another flow type has not yet been closed.")
    }
    const n = this.top();
    n.x += old.width;
    n.y += old.height;
  }
  
  endHorizontal() {
    const old = this.stack.pop();
    if(!old.horizontal)
    throw new Error("Unmatched flow! Tried to end horizontal when another flow type has not yet been closed.")
    const n = this.top();
    n.height += old.height;
  }

  /**
   * Get top of the positioning stack.
   * @returns {PositioningContext}
   */
  top() {
    // virtual 'root' context
    if(this.stack.length == 0) return PositioningContext.default();
    return this.stack[this.stack.length-1];
  }
}

