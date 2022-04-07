import { FONTS } from "../constants.mjs";
import Rect from "../math/rect.mjs";
import { Flags, getFlag, setFlag } from "../ui/debug.mjs";
import { Align } from "../ui/positioningContext.mjs";

export const debugUI = (dt, ui, world) => {
  ui.hidden = false;
  ui.font.color = "white";
  ui.font.family = FONTS.MONO;
  ui.font.size = 12;
  ui.startArea(new Rect(0,0, ui.ctx.canvas.width/3, ui.ctx.canvas.height), Align.START);
  ui.startVertical();
  ui.text(`frametime: ${(dt*1000).toFixed(3).padStart(6)}ms`);

  ui.space();

  ui.text(`pos: ${world.player.position.toString(3)}`);
  ui.text('vel: ' + world.player.velocity.toString(3));

  ui.space();

  ui.text('DEBUG FLAGS');
  setFlag(Flags.PATHFINDING, ui.checkbox(getFlag(Flags.PATHFINDING), "pathfinding visualisation"));
  setFlag(Flags.PLAYER, ui.checkbox(getFlag(Flags.PLAYER), "player debug"));
  setFlag(Flags.UI, ui.checkbox(getFlag(Flags.UI), "ui debug"));
  setFlag(Flags.AI, ui.checkbox(getFlag(Flags.AI), "ai debug"));
  setFlag(Flags.COLLISION, ui.checkbox(getFlag(Flags.COLLISION), "collision debug"));

  ui.space();
  
  ui.hidden = !getFlag(Flags.PATHFINDING);
  ui.text('PATHFINDING VIS:');
  ui.text('Left click to place point A.');
  ui.text('Right click to place point B.');
  ui.hidden = false;
  
  ui.endVertical();
  ui.endArea();
}