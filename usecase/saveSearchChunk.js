
import elastic from '../service/elastic.js';
import { ELASTIC_INDEX } from '../utils/constants.js';


/**
 * Process chunk of priceGroups and save into elastic
 * @param {string} sid 
 * @param {object} priceGroups 
 * @returns 
 */
const handleSearchChunk = async (sid, priceGroups) => {

    // Add search id into all priceGroups
    priceGroups = priceGroups.map(group => {
        group.sid = sid;

        // Add total into each 'segment of flight'
        let total = group.t;
        group.s = group.s.map(segment => {
            segment.t = total;
            return segment;
        });

        return group;
    });

    // Save chunck
    await elastic().bulk({
        body: priceGroups
            .map(entry => [{ index: { _index: ELASTIC_INDEX } }, entry])
            .flat()
    });

    // Return stream data
    return JSON.stringify({
        sid,
        completed: false,
        list: priceGroups.slice(0, 4),
    });
}

export default handleSearchChunk;