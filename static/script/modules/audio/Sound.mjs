import { audio } from "../audio.mjs";
import { randRange } from "../math/mod.mjs";

/**
 * @readonly
 * @enum {number}
 */
export const Sounds = {
  SHOOT: 0,
  EXPLOSION: 1,
  PICKUP_A: 2,
  PICKUP_B: 3,
}

const soundSrcMap = [
  ["gunshot1.wav"], ["explosion.wav"], ["item-pickup.wav"], ["grenade-pickup.wav"]
]

/** @type {{[type: Sounds] : Sound}} */
const soundMap = {};

export const initSounds = async () => {
  const promises = [];
  for(const i of Object.values(Sounds)) {
    soundMap[i] = new Sound(i, 4);
    promises.push(soundMap[i].load());
  }

  return Promise.allSettled(promises);
}

const loadSound = async (src) => {
  console.log(`Fetching sound from url (${src})...`)
  const res = await fetch(src);
  const buf = await res.arrayBuffer();
  return await audio.ctx.decodeAudioData(buf);
}

/**
 * 
 * @param {Sounds} sound 
 */
export const triggerSound = (sound) => {
  const s = soundMap[sound];
  if(!s) return;
  s.trigger();
}


export default class Sound {
  /** @type {Sounds} */
  sound;

  /** @type {AudioBuffer[]} */
  buffers = [];
  #i = 0;
  #j = 0;

  /**
   * 
   * @param {Sounds} sound 
   * @param {number} voices 
   */
  constructor (sound, voices = 1) {
    this.sound = sound;
    this.voices = Math.ceil(voices / soundSrcMap[this.sound].length);
  }

  async load() {
    for(const src of soundSrcMap[this.sound]) {
      this.buffers.push(await loadSound(URL_BASE + '/static/sound/' + src));
    }
  }

  trigger() {
    const buffer = this.buffers[this.#i];
    const v = audio.ctx.createBufferSource();
    v.buffer = buffer;
    v.connect(audio.gainNode);
    v.start();
    this.#i = (this.#i + 1) % this.buffers.length;
  }
}