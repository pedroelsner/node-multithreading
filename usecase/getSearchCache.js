import elastic from '../service/elastic.js';
import { ELASTIC_INDEX } from '../utils/constants.js';

/**
 * Make sort params for elastic query
 * @param {array} sortby 
 * @returns {array}
 */
const makeSort = (sortby) => {
    return sortby.map(sort => ({ [sort.field]: sort.order }))
}

/**
 * Make filter condition for elastic query
 * @param {object} f 
 * @returns {object}
 */
const makeFilter = (f) => {
    return f.condition ?
        { range: { [f.field]: { [f.condition]: f.value } } } :
        { term: { [f.field]: f.value } }
}

/**
 * Return filter condition for doc and neasted field 
 * @param {array} filterby 
 * @returns {array} [docFilter, neastedFilter]
 */
const makeAllFilters = (filterby) => {
    return [
        filterby.filter(f => !f.field.startsWith('s.')).map(makeFilter),
        filterby.filter(f => f.field.startsWith('s.')).map(makeFilter)
    ];
}


/**
 * Query elastic with pagination, order, filters
 * and make 'meta' for response
 * @param {string} sid Search ID 
 * @param {object} body 
 * @returns {object}
 */
const getSearchCache = async (sid, body) => {

    // Define default
    const page = body.page || { from: 0, size: 10 };
    const sortby = body.sortby || [{ field: 't', order: 'asc' }];
    const filterby = body.filterby || [{ field: 's.tmd', condition: 'gte', value: 0 }];

    // Make sort condition
    const sort = makeSort(sortby);

    // Make filters confition
    const [docFilter, nestedFilter] = makeAllFilters(filterby);


    const response = await elastic().search({
        index: ELASTIC_INDEX,
        body: {
            from: page.from,
            size: page.size,
            query: {
                bool: {
                    filter: [
                        { term: { 'sid.keyword': sid } },
                        ...docFilter,
                        {
                            nested: {
                                path: 's',
                                query: {
                                    bool: {
                                        filter: nestedFilter
                                    }
                                },
                                inner_hits: {}
                            }
                        }
                    ]
                }
            },
            sort: sort,
            aggs: {
                flights: {
                    nested: { path: 's' },
                    aggs: {
                        duration_segment_0: {
                            filter: { term: { 's.si': 0 } },
                            aggs: {
                                min_duration: { min: { field: 's.tmd' } },
                                max_duration: { max: { field: 's.tmd' } }
                            }
                        },
                        duration_segment_1: {
                            filter: { term: { 's.si': 1 } },
                            aggs: {
                                min_duration: { min: { field: 's.tmd' } },
                                max_duration: { max: { field: 's.tmd' } }
                            }
                        },
                        aircompanies: {
                            terms: { field: 's.cn.keyword' },
                            aggs: {
                                min_price: { min: { field: 's.t' } }
                            }
                        },
                        numberOfStops: {
                            terms: { field: 's.ns' },
                            aggs: {
                                min_price: { min: { field: 's.t' } }
                            }
                        }
                    }
                },
                min_price: { min: { field: 't' } },
                max_price: { max: { field: 't' } }
            }
        }
    });

    return response;
}

export default getSearchCache;