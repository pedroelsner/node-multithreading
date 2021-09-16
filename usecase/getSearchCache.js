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
 * Return filter meta for front-end
 * @param {object} aggs Aggregation
 * @returns 
 */
const makeFilterMeta = (aggs) => {

    const airCompanies = aggs.flights.air_companies.buckets.map(item => {
        return {
            stops: item.key,
            minPrice: item.min_price.value
        }
    });

    const numberOfStops = aggs.flights.number_of_stops.buckets.map(item => {
        return {
            stops: item.key,
            minPrice: item.min_price.value
        }
    });

    const duration = [
        {
            minDuration: aggs.flights.duration_segment_0.
                min_duration.value,
            maxDuration: aggs.flights.duration_segment_0.
                max_duration.value
        },
        {
            minDuration: aggs.flights.duration_segment_1.
                min_duration.value,
            maxDuration: aggs.flights.duration_segment_1.
                max_duration.value
        }
    ]

    return {
        airCompanies,
        numberOfStops,
        price: {
            minPrice: aggs.min_price.value,
            maxPrice: aggs.max_price.value
        },
        duration
    }
}


/**
 * Query elastic with pagination, order, filters
 * and make 'meta' for response
 * @param {string} sid Search ID 
 * @param {object} body 
 * @returns {object}
 */
const getSearchCache = async (sid, params) => {

    // Define default
    const page = params.page || { from: 0, size: 10 };
    const sortby = params.sortby || [{ field: 't', order: 'asc' }];
    const filterby = params.filterby || [{ field: 's.tmd', condition: 'gte', value: 0 }];

    // Make sort condition
    const sort = makeSort(sortby);

    // Make filters confition
    const [docFilter, nestedFilter] = makeAllFilters(filterby);


    const { body } = await elastic().search({
        index: ELASTIC_INDEX,
        body: {
            from: page.from,
            size: page.size,
            _source: [
                "uid", "di", "t", "i", "tx", "f",
                "d", "fr", "cf", "if", "pd", "hl"
            ],
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
                        air_companies: {
                            terms: { field: 's.cn.keyword' },
                            aggs: {
                                min_price: { min: { field: 's.t' } }
                            }
                        },
                        number_of_stops: {
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

    const list = body.hits.hits.map(item => {
        const entry = item._source;
        entry.s = item.inner_hits.s.hits.hits.map(s => s._source);
        return entry;
    });

    const filterMeta = makeFilterMeta(body.aggregations);

    return JSON.stringify({
        sid,
        completed: true,
        total: body.hits.total.value,
        list,
        page,
        sortby,
        filterby: params.filterby || [],
        filterMeta
    });
}

export default getSearchCache;