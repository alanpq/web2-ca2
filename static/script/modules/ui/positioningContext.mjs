'use strict';

import Rect from "../math/rect.mjs";
import Vector from "../math/vector.mjs";

/**
 * Enum for Flow types.
 * @readonly
 * @enum {number}
 */
export const Flow = {
  NONE: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
}

/**
 * Enum for Align types.
 * @readonly
 * @enum {number}
 */
export const Align = {
  START: 0, // like flex start
  CENTER: 1,
  END: 2, // like flex end
}

export default class PositioningContext {
  width = 0;
  height = 0;
  x = 0;
  y = 0;

  #explicit = false;
  #flow = Flow.NONE;
  #align = Align.START;
  #justify = Align.START; // TODO: implement

  get explicit() {return this.#explicit};
  get flow() {return this.#flow};
  get align() {return this.#align};
  get justify() {return this.#justify};

  constructor(x, y, width, height, flow, explicit, align, justify) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.#flow = flow;
    this.#explicit = explicit;
    this.#align = align;
    this.#justify = justify;
  }
  
  static default() {
    return new PositioningContext(0,0,0,0,Flow.NONE,false, Align.START, Align.START);
  }

  get horizontal() {return this.flow == Flow.HORIZONTAL};
  get vertical() {return this.flow == Flow.VERTICAL};

  /**
   * Create new child context with flow
   * @param {Flow} flow 
   * @param {PositioningContext} parent 
   */
  static newFlow(flow, parent, align=null, justify=null) {
    const pos = parent.computeOffset();
    return new PositioningContext(
      pos.x, pos.y,
      (flow == Flow.VERTICAL) ? parent.width : 0,
      (flow == Flow.HORIZONTAL) ? parent.height : 0,
      flow, false, align || parent.align, justify || parent.justify, // inherit align/justify if none specified
    );
  }

  /**
   * Create a new area.
   * @param {Rect} rect 
   * @returns {PositioningContext}
   */
  static newArea(rect, align, justify) {
    if(align == null) throw new Error("No align specified!");
    if(justify == null) throw new Error("No justify specified!");
    return new PositioningContext(
      rect.left, rect.top,
      rect.width, rect.height,
      Flow.NONE, true, align, justify,
    );
  }

  /**
   * 
   * @param {number} widget Widget dimension
   * @param {number} dimension Container dimension
   * @returns 
   */
  #startOffset(widget, dimension) {
    switch(this.#align) {
      case Align.START:
        return 0
      case Align.END:
        return dimension-widget
      case Align.CENTER:
        return (dimension - widget)/2
    }
  }

  /**
   * Compute offset for a new child in this context.
   * @param {number} width Width of the widget
   * @param {number} height Height of the widget
   * @returns {Vector}
   */
  computeOffset(width=0, height=0, aligned=false) {
    const hor = this.horizontal && !this.explicit;
    const ver = this.vertical && !this.explicit;
    return new Vector(
      this.x + (this.width*hor) + this.#startOffset(width, this.width) * (aligned && ver),
      this.y + (this.height*ver) + this.#startOffset(height, this.height) * (aligned && hor),
    );
  }

  /**
   * Compute a new widget clip rect that fits in this context.
   * @param {number} width width of the widget 
   * @param {number} height height of the widget 
   */
  computeClipRect(width=0, height=0) {
    const pos = this.computeOffset(width, height, false);
    return new Rect(
      pos.x, pos.y,
      !this.horizontal ? this.width : width,
      !this.vertical ? this.height : height,
    );
  }

  /**
   * Compute a new widget rect that fits in this context.
   * @param {number} width width of the widget 
   * @param {number} height height of the widget 
   */
  computeWidgetRect(width=0, height=0) {
    const pos = this.computeOffset(width, height, true);
    return new Rect(
      pos.x, pos.y,
      width,
      height,
    );
  }
  /**
   * Expand this context with a new widget.
   * @param {Rect} rect The widget's bounding box.
   */
  expand(rect) {
    if (this.explicit) return; // FIXME: probably not good
    if(this.horizontal) {
      this.height = Math.max(this.height, rect.height);
      this.width += rect.width;
    } else if(this.vertical) {
      this.width = Math.max(this.width, rect.width);
      this.height += rect.height;
    }
  }
}