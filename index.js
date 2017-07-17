// inspired by
// https://github.com/rauschma/shared-array-buffer-demo/blob/master/lock_es6.js
// lock count, lock max
const NUMINTS = 2;

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
    Atomics.store(iab, ibase, 0);
    Atomics.store(iab, ibase + 1, max);
    return s;
  }

  acquire(count = 1) {
    const current = Atomics.load(this.iab, this.ibase, 1);
    const max = Atomics.load(this.iab, this.ibase + 1);
    if (current + count - 1 >= max) return false;
    Atomics.store(this.iab, this.ibase, current + count);
    Atomics.wake(this.iab, this.ibase, 1);
    return true;
  }

  release(count = 1) {
    const current = Atomics.load(this.iab, this.ibase);
    Atomics.store(this.iab, this.ibase, Math.max(0, current - count));
    Atomics.wake(this.iab, this.ibase, 1);
    return true;
  }

  toString() {
    return `Semaphore:{ibase:${this.ibase}}`;
  }

  inspect() {
    return this.toString();
  }
}

module.exports = Semaphore;
