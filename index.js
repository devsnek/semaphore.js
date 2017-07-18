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
    store(s, 0, max);
    return s;
  }

  static load(iab, ibase) {
    return new Semaphore(iab, ibase);
  }

  acquire(count = 1) {
    const { acquired, max } = get(this);
    if (acquired + count - 1 >= max) return false;
    store(this, acquired + count, max);
    return true;
  }

  release(count = 1) {
    const { acquired, max } = get(this);
    if (acquired - count < 0) return false;
    store(this, acquired - count, max);
    return true;
  }

  wait() {
    let { acquired, max } = get(this);
    if (acquired >= max) {
      do {
        Atomics.wait(this.iab, this.ibase, acquired, Number.POSITIVE_INFINITY);
      } while ((acquired = get(this).acquired) >= max);
    }
  }

  get acquired() {
    return get(this).acquired;
  }

  toString() {
    return `Semaphore:{ibase:${this.ibase}}`;
  }

  inspect() {
    return this.toString();
  }
}

function get(sem) {
  const i = Atomics.load(sem.iab, sem.ibase);
  return {
    acquired: i & 0xFFFF,
    max: (i >> 16) & 0xFFFF,
  }
}

function store(sem, acquired, max) {
  Atomics.store(sem.iab, sem.ibase, acquired | (max << 16));
  Atomics.wake(sem.iab, sem.ibase, 1);
}

module.exports = Semaphore;
