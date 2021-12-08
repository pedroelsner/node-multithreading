import { Client } from '@elastic/elasticsearch';

let instance;

/**
 * Initialize instance of elastic client
 * @returns {object}
 */
const init = () => {
    if (!instance) {
        instance = new Client({ node: 'http://localhost:9200' });
    }
    return instance;
}

/**
 * Singleton pattern
 * @returns {object}
 */
const singleton = () => {
    return instance || init();
}

export default singleton;