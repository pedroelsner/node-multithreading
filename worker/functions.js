import workerpool from 'workerpool';

import saveSearchChunk from '../usecase/saveSearchChunk.js';
import getSearchCache from '../usecase/getSearchCache.js';

workerpool.worker({
    JSONstringify: JSON.stringify,
    saveSearchChunk,
    getSearchCache,
})