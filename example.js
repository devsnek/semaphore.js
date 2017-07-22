/* global SharedArrayBuffer */

const Semaphore = require('.');

const sharedBuffer = new SharedArrayBuffer(2 * Int32Array.BYTES_PER_ELEMENT);
const sharedArray = new Int32Array(sharedBuffer);

// New semaphore with max of 10 acquired locks
const s = Semaphore.create(sharedArray, 0, 10);
// In a worker or something you can do
// const s = Semaphore.load(new Int32Array(sharedBuffer), 0);

s.acquire(11); // false
s.acquire(10); // true
s.acquire(); // false
s.release(5); // true
s.acquire(6); // false
