import UI from "../ui/ui.mjs"
import { fetchScores, requestToken, submitScore } from "./api.mjs";

let username = "";
let submitState = "";

let scoreboard;
let scoreboardPromise;
let scoreboardState = "";
let scoreboardLoading = false;

const loadScoreboard = async () => {
  scoreboardLoading = true;
  console.debug("fetching scoreboard...");
  scoreboardState = "Loading...";

  scoreboardPromise = fetchScores();


  scoreboardPromise.then((s) => {
    console.debug("fetched");
    scoreboard = s.slice(0,5);
    console.debug(s);
  }).catch((reason) => {
    console.error(reason);
    scoreboardState = "Could not load leaderboards.";
  })
}

/**
 * 
 * @param {number} dt Deltatime in seconds
 * @param {UI} ui UI Object
 */
export const drawScoreboard = (dt, ui, score) => {

  if(!scoreboardLoading && !scoreboard) loadScoreboard();

  ui.font.size = 12;
  ui.space();
  username = ui.input(username, 200);
  if(username.length > 20) username = username.slice(0, 20);
  ui.textPadding.top = 5;
  ui.textPadding.bottom = 5;
  ui.font.color = "rgba(255,255,255,0.5)";
  if(ui.button("Submit")) {
    submitScore(username, score).then(() => {
      submitState = "Submitted!";
      loadScoreboard();
    }).catch(() => {
      submitState = "Failed to submit.";
    });
    submitState = "Submitting...";
  }
  ui.text(submitState);
  ui.font.color = "white";
  ui.textPadding.top = 2;
  ui.textPadding.bottom = 2;

  
  ui.font.size = 17;
  ui.text("Leaderboard");
  ui.font.color = "rgba(255,255,255,0.5)";
  if(scoreboard != null) {
    ui.font.color = "white";
    let max = 0;
    for(const s of scoreboard) {
      if(s.username.length > max) max = s.username.length;
    }
    for(const s of scoreboard) {
      ui.text(`${s.username.padStart(max)}: ${s.score}`);
    }
  } else ui.text(scoreboardState);
  ui.font.size = 12;
  ui.font.color = "white";
}