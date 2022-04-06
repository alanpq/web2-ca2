'use strict';
import Vector from "../math/vector.mjs";

/**
 * Same state as {@link keyMap}
 */
const mouseState = {
  pos: new Vector(),
  left: 0,
  right: 0,
  eaten: false, // hack: whether the mouse has been eaten (used by the ui)
};
/** mouse state that should be applied just before the next frame */
let futureMouseState = {left: false, right: false};

export const init = (el) => {
  el.addEventListener("mousemove", (e) => {
    mouseState.pos.x = e.offsetX;
    mouseState.pos.y = e.offsetY;
  });
  
  // prevent context menu when clicking on canvas
  el.addEventListener("contextmenu", (e) => {e.preventDefault()});
  el.addEventListener("mousedown", (e) => {
    if (e.button == 0) {
      futureMouseState.left = true;
    } else if (e.button == 2) {
      futureMouseState.right = true;
    }
  })
  window.addEventListener("mouseup", (e) => {
    if (e.button == 0) {
      futureMouseState.left = false;
    } else if (e.button == 2) {
      futureMouseState.right = false;
    }
  });
}

export const tick = () => {
  // do the same thing with the mouse
  if(mouseState.left % 2 != 0) mouseState.left -= 1;
  if(mouseState.right % 2 != 0) mouseState.right -= 1;

  if (futureMouseState.left != null)
    mouseState.left = (futureMouseState.left * 2) + 1;
  if (futureMouseState.right != null)
    mouseState.right = (futureMouseState.right * 2) + 1;
  futureMouseState = {left: null, right: null};
}

export const setMouseEat = (eaten) => {
  mouseState.eaten = eaten;
}

export const isMouseEaten = () => mouseState.eaten;

/** Get current mouse position */
export const mouse = () => {
  return mouseState.pos;
}
/** Get if left mouse button is held */
export const leftMouse = (ignoreEat = false) => {
  return (mouseState.left > 1) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}
/** Get if right mouse button is held */
export const rightMouse = (ignoreEat = false) => {
  return (mouseState.right > 1) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}
/** Get if left mouse button has just been pressed */
export const leftMouseDown = (ignoreEat = false) => {
  return (mouseState.left == 3) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}
/** Get if right mouse button has just been pressed */
export const rightMouseDown = (ignoreEat = false) => {
  return (mouseState.right == 3) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}
/** Get if left mouse button has just been released */
export const leftMouseUp = (ignoreEat = false) => {
  return (mouseState.left == 1) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}
/** Get if right mouse button has just been released */
export const rightMouseUp = (ignoreEat = false) => {
  return (mouseState.right == 1) && (!mouseState.eaten || (ignoreEat&&mouseState.eaten));
}