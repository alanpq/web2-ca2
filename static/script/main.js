'use strict';
import * as spa from './modules/spa.mjs';

import Game from './modules/game.mjs';
import Renderer from './modules/renderer.mjs';

import * as input from './modules/input/mod.mjs';
import { fetchScores } from './modules/scoreboard/api.mjs';

const canvas = document.getElementById("canvas");
const renderer = new Renderer(canvas);
input.init(canvas);

spa.initSPA(
  document.querySelector("nav"),
  document.querySelector("main"),
);

const clean = function (str) {
	const tmp = document.createElement('p');
	tmp.textContent = str;
	return tmp.innerHTML;
};

const rank = document.getElementById("rank");

/** @type {Game} */
let game;

spa.addEventListener("game", "open", async () => {
  if(game) game.destroy();
  game = new Game(renderer);
  await game.load();
  game.start();
  setTimeout(() => {
    // no idea why this needs to be here twice, but it works so i dont care
    renderer.conformToParent();
    renderer.conformToParent();
  }, 0);
});

spa.addEventListener("rank", "open", async () => {
  const scores = await fetchScores();
  const tmp = [`<table><tr><th scope="col">Username</th><th scope="col">Score</th></tr>`];
  for(const s of scores) {
    tmp.push('<tr>')
    tmp.push(`<td>${clean(s.username)}</td>`)
    tmp.push(`<td>${clean(s.score)}</td>`)
    tmp.push('</tr>')
  }
  tmp.push('</table>');
  rank.innerHTML = tmp.join('');
});

spa.addEventListener("game", "close", () => {
  if(game)
    game.destroy();
});
spa.goto('game');