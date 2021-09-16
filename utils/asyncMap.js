
/**
 * asyncMap for loop no-block event-loop
 * PS: 'arr' will be change after each iterator
 * 
 * @param {array} arr 
 * @param {Function} callback 
 * @returns
 * 
 * @example
 * asyncMap(arr, console.log)
 *   .then(() => console.log('finish loop'))
 *   .catch((err) => console.error(err));
 */
function asyncMap(arr, callback) {
    return new Promise(async (resolve, reject) => {
        recursivelyAsyncMap(resolve, reject, arr, callback).catch(reject);
    });
}

/**
 * asyncMap Iterator no-block event-loop with setImmediate
 * @param {Function} resolve 
 * @param {Function} reject 
 * @param {array} arr 
 * @param {Function} callback 
 * @param {number} i 
 */
async function recursivelyAsyncMap(resolve, reject, arr, callback, i = 0) {
    if (i === arr.length) {
        resolve();
    } else {
        try {
            const element = arr[i];
            arr[i] = await callback(element);

            setImmediate(() => {
                recursivelyAsyncMap(resolve, reject, arr, callback, ++i);
            });
        } catch (err) {
            reject(err)
        }
    }
}

export default asyncMap;
