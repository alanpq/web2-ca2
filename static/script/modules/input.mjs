/**
 * @typedef Button
 * @type {object}
 * @prop {0|1|2|3} state The state of the button
 * @prop {string[]} keys The physical keys that map to this button.
 */

import Vector from "./math/vector.mjs";

/**
 * Definition of virtual button inputs and their mapped keys
 * @type {{[button: string]: Button}}
 */
const buttons = {
  "up": {state: 0, keys: ["w"]},
  "left": {state: 0, keys: ["a"]},
  "down": {state: 0, keys: ["s"]},
  "right": {state: 0, keys: ["d"]},
}

const axes = {
  "vertical": ["up", "down"],
  "horizontal": ["right", "left"],
}

/** lookup from physical key -> virtual button */
const buttonsRev = {};

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

/**
 * @name keyMap
 * 0: up,
 * 1: just released,
 * 2: down,
 * 3: just pressed
 */
const keys = {};

// we gather all key changes that happen in the current frame,
// to be applied for the start of the next.
let keyQueue = []; 


/**
 * 
 * @param {HTMLElement} el 
 */
export const init = (el) => {
  Object.entries(buttons).forEach(([k,v]) => {
    v.keys.forEach(key => {
      buttonsRev[key] = k;
    })
  })
  console.debug("Button mapping:", buttonsRev);

  // add any key pressed/releases to the queue
  window.addEventListener("keydown", (e) => {
    if(!buttonsRev[e.key]) return;
    keyQueue.push([e.key, true]);
  })
  window.addEventListener("keyup", (e) => {
    if(!buttonsRev[e.key]) return;
    keyQueue.push([e.key, false]);
  })
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
  Object.values(buttons).forEach(btn => {
    btn.keys.forEach((key) => {
      if(!keys[key]) return;
      // if key value is 1 or 3, move them down to 0 or 2
      if(keys[key] % 2 != 0) keys[key] -= 1;
      buttons[buttonsRev[key]].state = keys[key];
    })
  });
  // do the same thing with the mouse
  if(mouseState.left % 2 != 0) mouseState.left -= 1;
  if(mouseState.right % 2 != 0) mouseState.right -= 1;

  if (futureMouseState.left != null)
    mouseState.left = (futureMouseState.left * 2) + 1;
  if (futureMouseState.right != null)
    mouseState.right = (futureMouseState.right * 2) + 1;
  futureMouseState = {left: null, right: null};

  keyQueue.forEach(([key, down]) => {
    // only positive of type coersion
    keys[key] = (down * 2) + 1; // 3 if true, 1 if false
    buttons[buttonsRev[key]].state = keys[key];
  });
  keyQueue = [];
}

/**
 * Get if a button is currently held down
 * @param {string} btn Button name
 * @returns {boolean}
 */
export const button = (btn) => {
  if(!buttons[btn]) return false;
  return buttons[btn].state > 1;
}
/**
 * Get if a button is has been pressed
 * @param {string} btn Button name
 * @returns {boolean}
 */
export const buttonDown = (btn) => {
  if(!buttons[btn]) return false;
  return buttons[btn].state == 3;
}
/**
 * Get if a button is has been pressed
 * @param {string} btn Button name
 * @returns {boolean}
 */
export const buttonUp = (btn) => {
  if(!buttons[btn]) return false;
  return buttons[btn].state == 1;
}

/**
 * 
 * @param {string} axis Name of input axis
 * @returns {number} Value of input axis
 */
export const axis = (axis) => {
  if(!axes[axis]) return console.error("Invalid input axis", axis);
  return button(axes[axis][0]) - button(axes[axis][1]);
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