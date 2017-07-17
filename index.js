// inspired by
// https://github.com/rauschma/shared-array-buffer-demo/blob/master/lock_es6.js
// lock count, lock max
const NUMINTS = 1;

class Semaphore {
  constructor(iab, ibase) {
    if (!(iab instanceof Int32Array && ibase | 0 === ibase && ibase >= 0 && ibase + NUMINTS <= iab.length)) {
      throw new Error(`Bad arguments to Semaphore constructor: ${iab} ${ibase}`);
    }
    this.iab = iab;
    this.ibase = ibase;
  }

  static create(iab, ibase, max = 1) {
    const s = new Semaphore(iab, ibase);
    Atomics.store(iab, ibase, store(0, max));
    return s;
  }

  static load(iab, ibase) {
    return new Semaphore(iab, ibase);
  }

  acquire(count = 1) {
    const { acquired, max } = get(Atomics.load(this.iab, this.ibase));
    if (acquired + count - 1 >= max) return false;
    Atomics.store(this.iab, this.ibase, store(acquired + count, max));
    Atomics.wake(this.iab, this.ibase, 1);
    return true;
  }

  release(count = 1) {
    const { acquired, max } = get(Atomics.load(this.iab, this.ibase));
    if (acquired - count < 0) return false;
    Atomics.store(this.iab, this.ibase, store(acquired - count, max));
    Atomics.wake(this.iab, this.ibase, 1);
    return true;
  }

  get acquired() {
    return get(Atomics.load(this.iab, this.ibase)).acquired;
  }

  toString() {
    return `Semaphore:{ibase:${this.ibase}}`;
  }

  inspect() {
    return this.toString();
  }
}

function get(i) {
  return {
    acquired: i & 0xFFFF,
    max: (i >> 16) & 0xFFFF,
  }
}

function store(count, max) {
  return count | (max << 16);
}

module.exports = Semaphore;
