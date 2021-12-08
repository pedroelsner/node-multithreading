
/**
 * asyncEach for loop no-block event-loop
 * @param {array} arr 
 * @param {Function} callback 
 * @returns
 * 
 * @example
 * asyncEach(arr, console.log)
 *   .then(() => console.log('finish loop'))
 *   .catch((err) => console.error(err));
 */
function asyncEach(arr, callback) {
    return new Promise(async (resolve, reject) => {
        recursivelyAsyncEach(resolve, reject, arr, callback).catch(reject);
    });
}

/**
 * asyncEach Iterator no-block event-loop with setImmediate
 * @param {Function} resolve 
 * @param {Function} reject 
 * @param {array} arr 
 * @param {Function} callback 
 * @param {number} i 
 */
async function recursivelyAsyncEach(resolve, reject, arr, callback, i = 0) {
    if (i === arr.length) {
        resolve();
    } else {
        try {
            const element = arr[i];
            await callback(element);

            setImmediate(() => {
                recursivelyAsyncEach(resolve, reject, arr, callback, ++i);
            });
        } catch (err) {
            reject(err)
        }
    }
}

export default asyncEach;
