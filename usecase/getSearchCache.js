import { ELASTIC_INDEX } from '../utils/constants.js';

const getSearchCache = async (req, res, elastic) => {
    try {
        const response = await elastic.search({
            index: ELASTIC_INDEX,
            body: {
                from: 0,
                size: 10,
                query: {
                    match: {
                        sid: res.locals.searchId
                    }
                }
            }
        });
        return response;

    } catch (err) {
        console.error('Error when get cache elastic');
        throw err;
    }
}

export default getSearchCache;