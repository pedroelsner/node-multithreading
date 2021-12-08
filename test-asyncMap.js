
import asyncMap from './utils/structure/asyncMap.js';

const arr = Array(3)
    .fill(0)
    .map((_, i) => ++i);

console.log('before loop');

asyncMap(arr, (value) => {
    console.log(value);
    return value * value;
})
    .then(() => {
        console.dir('finish loop');
        console.log(arr);
    })
    .catch((err) => console.dir(err));

console.log('after loop');