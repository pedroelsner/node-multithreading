import workerpool from 'workerpool';
import { join, resolve } from 'path';

let instance = null

/**
 * Initialize worker for pool of threads
 * @param {object} options 
 */
export const init = async (options) => {
    const pool = workerpool.pool(join(resolve(), './worker/functions.js'), options);
    instance = await pool.proxy();

    console.dir(`Worker Threads Enabled - Min Workers: ${pool.minWorkers} - Max Workers: ${pool.maxWorkers} - Worker Type: ${pool.workerType}`)
}

/**
 * Return instance of pool
 * @returns {object}
 */
export const get = () => {
    return instance
}

export default { init, get }
