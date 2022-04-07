const AudioContext = window.AudioContext || window.webkitAudioContext;
export const audio = {
  /** @type {AudioContext} */
  ctx: null,
  /** @type {GainNode} */
  gainNode: null,
};

export const startAudio = () => {
  audio.ctx = new AudioContext();
  audio.gainNode = audio.ctx.createGain();
  audio.gainNode.connect(audio.ctx.destination);
}
