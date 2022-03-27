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

/**
 * @type {PositioningContext[]}
 */
const posStack = [];

export const startVertical = () => {
  const pctx = top();
  posStack.push({
    horizontal: false,
    width: 0,
    height: 0,
    x: pctx.x + pctx.width * pctx.horizontal,
    y: pctx.y + pctx.height * !pctx.horizontal,
  })
}

export const startHorizontal = () => {
  const pctx = top();
  posStack.push({
    horizontal: true,
    width: 0,
    height: 0,
    x: pctx.x + pctx.width * pctx.horizontal,
    y: pctx.y + pctx.height * !pctx.horizontal,
  })
}

/**
 * Get top of the positioning stack.
 * @returns {PositioningContext}
 */
const top = () => {
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

/** @type {SidedValues} */
export const textPadding = {top: 2, right: 2, bottom: 2, left: 2};

export const setTextPadding = (top, right, bottom, left) => {
  textPadding.top = top || textPadding.top;
  textPadding.right = right || textPadding.right;
  textPadding.bottom = bottom || textPadding.bottom;
  textPadding.left = left || textPadding.left;
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 */
export const text = (ctx, text) => {
  //TODO: multiline text
  const pctx = top();
  const metrics = ctx.measureText(text);
  const w = metrics.width + textPadding.left + textPadding.right;
  const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            + textPadding.top + textPadding.bottom;
  if(pctx.horizontal) { // horizontal flow
    ctx.fillText(text, pctx.x + pctx.width + textPadding.left, pctx.y + textPadding.top);
    pctx.width += w;
    pctx.height = Math.max(pctx.height, h);
  } else { // vertical flow
    if(pctx.height == 0) pctx.height = h;
    ctx.fillText(text, pctx.x + textPadding.left, pctx.y + pctx.height + textPadding.top);
    pctx.width = Math.max(pctx.width, w);
    pctx.height += h;
  }
}

//TODO: need to sanity check endVertical/Horizontal, to ensure start's and end's are paired up correctly

export const endVertical = () => {
  const old = posStack.pop();
  if(old.horizontal)
    throw new Error("Unmatched horizontal flow! Tried to end vertical when a horizontal has not yet been closed.")
  const n = top();
  n.x += old.width;
  n.y += old.height;
}

export const endHorizontal = () => {
  const old = posStack.pop();
  if(!old.horizontal)
    throw new Error("Unmatched vertical flow! Tried to end horizontal when a vertical has not yet been closed.")
  const n = top();
  n.height += old.height;
}