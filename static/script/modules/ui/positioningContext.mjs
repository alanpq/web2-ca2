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

export default class PositioningContext {
  width = 0;
  height = 0;
  x = 0;
  y = 0;

  #explicit = false;
  #flow = Flow.NONE;

  get explicit() {return this.#explicit};
  get flow() {return this.#flow};

  constructor(x, y, width, height, flow, explicit) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.#flow = flow;
    this.#explicit = explicit;
  }
  
  static default() {
    return new PositioningContext(0,0,0,0,Flow.NONE,false);
  }

  get horizontal() {return this.flow == Flow.HORIZONTAL};
  get vertical() {return this.flow == Flow.VERTICAL};

  /**
   * Create new child context with flow
   * @param {Flow} flow 
   * @param {PositioningContext} parent 
   */
  static newFlow(flow, parent) {
    const pos = parent.computeOffset();
    return new PositioningContext(
      pos.x, pos.y,
      (flow == Flow.VERTICAL) ? parent.width : 0,
      (flow == Flow.HORIZONTAL) ? parent.height : 0,
      flow, false,
    );
  }

  /**
   * Create a new area.
   * @param {Rect} rect 
   * @returns {PositioningContext}
   */
  static newArea(rect) {
    return new PositioningContext(
      rect.left, rect.top,
      rect.width, rect.height,
      Flow.NONE, true
    );
  }

  /**
   * Compute offset for a new child in this context.
   * @returns {Vector}
   */
  computeOffset() {
    return new Vector(
      this.x + (this.width * (this.horizontal && !this.explicit)),
      this.y + (this.height * (this.vertical && !this.explicit)),
    );
  }

  /**
   * Compute a new widget rect that fits in this context.
   * @param {number} width width of the widget 
   * @param {number} height height of the widget 
   */
  computeWidgetRect(width=0, height=0) {
    const pos = this.computeOffset();
    return new Rect(
      pos.x, pos.y,
      !this.horizontal ? this.width : width,
      !this.vertical ? this.height : height,
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