export class Dict2D {
  #map = {};
  #keys = [];
  constructor(fallback) {
    this.fallback = fallback;
  }
  set(pos, val) {
    if(this.#map[pos.x] === undefined) this.#map[pos.x] = {};
    if(this.#map[pos.x][pos.y] === undefined) this.#keys.push(pos);
    this.#map[pos.x][pos.y] = val;
  }
  get(pos) {
    if(this.#map[pos.x] === undefined) return this.fallback;
    if(this.#map[pos.x][pos.y] === undefined) return this.fallback;
    return this.#map[pos.x][pos.y];
  }
  entries() {
    return this.#keys.map((k) => {
      return [k, this.#map[k.x][k.y]];
    });
  }
}