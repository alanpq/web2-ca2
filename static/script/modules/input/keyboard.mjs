'use strict';
import { buttons } from "./mod.mjs";
/**
 * @typedef Button
 * @type {object}
 * @prop {0|1|2|3} state The state of the button
 * @prop {string[]} keys The physical keys that map to this button.
 */

/** lookup from physical key -> virtual button */
const buttonsRev = {};

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