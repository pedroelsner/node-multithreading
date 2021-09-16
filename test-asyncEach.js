
import asyncEach from './utils/asyncEach.js';

const arr = Array(3)
    .fill(0)
    .map((_, i) => ++i);

console.log('before loop');

asyncEach(arr, console.log)
    .then(() => console.dir('finish loop'))
    .catch((err) => console.dir(err));

console.log('after loop');
