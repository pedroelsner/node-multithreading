import workerpool from 'workerpool';

import saveSearchChunk from '../usecase/saveSearchChunk.js';

workerpool.worker({
    stringify: JSON.stringify,
    saveSearchChunk
})