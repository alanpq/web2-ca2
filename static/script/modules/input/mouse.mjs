import Vector from "../math/vector.mjs";

/**
 * Same state as {@link keyMap}
 */
const mouseState = {
  pos: new Vector(),
  left: 0,
  right: 0,
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

/** Get current mouse position */
export const mouse = () => {
  return mouseState.pos;
}
/** Get if left mouse button is held */
export const leftMouse = () => {
  return mouseState.left > 1;
}
/** Get if right mouse button is held */
export const rightMouse = () => {
  return mouseState.right > 1;
}
/** Get if left mouse button has just been pressed */
export const leftMouseDown = () => {
  return mouseState.left == 3;
}
/** Get if right mouse button has just been pressed */
export const rightMouseDown = () => {
  return mouseState.right == 3;
}
/** Get if left mouse button has just been released */
export const leftMouseUp = () => {
  return mouseState.left == 1;
}
/** Get if right mouse button has just been released */
export const rightMouseUp = () => {
  return mouseState.right == 1;
}