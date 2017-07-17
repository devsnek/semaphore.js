const Semaphore = require('.');

const sharedBuffer = new SharedArrayBuffer(2 * Int32Array.BYTES_PER_ELEMENT);
const sharedArray = new Int32Array(sharedBuffer);

// new semaphore with max of 10
const s = Semaphore.create(sharedArray, 0, 10);

s.acquire(11) // false
s.acquire(10) // true
s.acquire() // false
s.release(5) // true
s.acquire(6) // false
