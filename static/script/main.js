import * as spa from './modules/spa.mjs';
import Game from './modules/game.mjs';

import Vector from './modules/math/vector.mjs';

const canvas = document.querySelector("canvas");

spa.initSPA(
  document.querySelector("nav"),
  document.querySelector("main"),
);

/** @type {Game} */
let game;

spa.addEventListener("game", "open", async () => {
  if(game) game.destroy();
  game = new Game(canvas);
  await game.load();
  game.start();
});

spa.addEventListener("game", "close", () => {
  game.destroy();
});