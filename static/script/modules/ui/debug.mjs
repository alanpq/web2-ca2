import { FONTS } from "../constants.mjs";
import Rect from "../math/rect.mjs";
import UI from "./ui.mjs";


/**
 * @readonly
 * @enum {number}
 */
export const Flags = {
  PATHFINDING: 0,
  AI: 1,
  PLAYER: 2,
}

/**
 * 
 * @param {Flags} flag 
 * @param {boolean} state 
 */
export const setFlag = (flag, state) => {
  flags[flag] = state;
}
/**
 * 
 * @param {Flags} flag
 * @returns {boolean} 
 */
export const getFlag = (flag) => flags[flag] || false;

/**
 * Debug flags for various categories
 */
const flags = {}

/**
 * @typedef CBCollection
 * @type {object}
 * @prop {DebugUIEvent[]} ui
 * @prop {DebugDrawEvent[]} draw
 * @prop {DebugTickEvent[]} tick
*/

/**
 * @type {{[flag: number]: CBCollection}
 */
export const cbs = {};

const invokeCallbacks = (event, args) => {
  for (const flag of Object.values(Flags)) {
    if (!getFlag(flag)) continue;
    if (!cbs[flag]) continue;
    if (!cbs[flag][event]) continue;
    for (const cb of cbs[flag][event])
      cb(...args);
  }
}

/**
 * 
 * @param {number} dt Deltatime in seconds
 * @param {UI} ui UI Object
 */
export const ui = (dt, ui) => {
  invokeCallbacks("ui", [dt, ui])
}

/**
 * 
 * @param {number} dt Deltatime in seconds
 * @param {CanvasRenderingContext2D} ctx Render context
 */
export const draw = (dt, ctx) => {
  invokeCallbacks("draw", [dt, ctx])
}

/**
 * 
 * @param {number} dt Deltatime in seconds
 */
 export const tick = (dt) => {
  invokeCallbacks("tick", [dt])
}

/**
 * @callback DebugUIEvent
 * @param {number} dt
 * @param {UI} ui
 */
/**
 * @callback DebugDrawEvent
 * @param {number} dt
 * @param {CanvasRenderingContext2D} ctx
 */
/**
 * @callback DebugTickEvent
 * @param {number} dt
 */

/**
 * 
 * @param {string} flag Name of debug flag
 * @param {DebugCallback} uiCB 
 */
export const registerDebug = (flag, event, uiCB) => {
  if(!flags[flag]) flags[flag] = false
  if(!cbs[flag]) cbs[flag] = {
    ui: [],
    tick: [],
    draw: [],
  };
  cbs[flag][event].push(uiCB);
}