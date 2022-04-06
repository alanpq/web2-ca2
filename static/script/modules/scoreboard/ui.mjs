import UI from "../ui/ui.mjs"

let username = "";

/**
 * 
 * @param {number} dt Deltatime in seconds
 * @param {UI} ui UI Object
 */
export const drawScoreboard = (dt, ui) => {
  ui.font.size = 12;
  ui.startHorizontal();
  username = ui.input(username, 200);
  ui.button("Submit");
  ui.endHorizontal();
}