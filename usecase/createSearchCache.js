import fetch from 'node-fetch';

import workerPool from '../worker/pool.js';
import nanoid from '../utils/nanoid.js';


/**
 * Fetch data from BFF, save into elasticsearch
 * and return Search ID
 * @param {express.Request} req 
 * @param {express.response} res 
 * @returns {string}
 */
const createSearchCache = async (req, res) => {

    // Generate Search ID
    const sid = await nanoid();

    // Fetch
    const response = await fetch("https://www.cvc.com.br/api/flights/Search/AsyncStream", {
        headers: {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-api-version": '3.0',
            "cookie": "_am.p13n=b2a08892-3b5d-557f-8c43-3782f835fce7; tt.u=0100007FE2F0965FA506A20A027BE808; NEW_EXPERIENCE_SNACKBAR=true; _ga=GA1.4.1637616206.1603727586; _hjid=331bb728-1638-432e-8072-368a5158e691; _fbp=fb.2.1604689694046.763460159; __gads=ID=0f44643178d8b712:T=1604698562:S=ALNI_MbsTjii7sLAqfOsBQWwDC_N4tu5bA; _ttuu.s=1605730965155; covid19=true; _ducp=eyJfZHVjcCI6IjJlOTM4YTViLWNkNDUtNDg5Yy1iYTE0LTNkOGVhOTdmNDkyOSIsIl9kdWNwcHQiOiIifQ==; FPC=id=97a85d89-7c42-4f1a-ad3b-7c1b212dc0c3; WTPERSIST=; mmapi.store.p.0=%7B%22mmparams.d%22%3A%7B%7D%2C%22mmparams.p%22%3A%7B%22pd%22%3A%221656020522247%7C%5C%22R4or3XwdvL-5k4Rb7hNYT0UwlgzCvfddNsTJ1tmvUoA%3D%7CGQAAAApDH4sIAAAAAAAEAGNhyG4Wf3FIeO5rBubMxBRGIQZGJ4bCz5UnOBh6jWv29Jvd9Djg-Ue6u-mGBwMQ_IcCBjaXzKLU5BLG5SKMIHEwgEmCaKgQoysAxknKHWEAAAA%3D%5C%22%22%2C%22bid%22%3A%221624485121883%7C%5C%22prodiadcgus04%5C%22%22%2C%22srv%22%3A%221656020522286%7C%5C%22prodiadcgus04%5C%22%22%2C%22uat%22%3A%221656020522337%7C%7B%5C%22CVC_UserType%5C%22%3A%5C%22NaoIdentificado%5C%22%7D%22%7D%7D; _gaexp=GAX1.3.clZlkGCYRVCR1Ud2kqnxGQ.18886.0; _dyn_id.740a=83ac09f2-1c84-561b-a556-ed9da258a8fd.1617195923.5.1626290717.1625313663.147d5887-66f2-4362-ac91-eef2e02426d0; _gcl_au=1.1.632133559.1629318292; _gid=GA1.3.680824586.1631020655; _am.session_id=e91c9f0f-a7bf-3cb2-6a4a-7ae66bc93c1d; _hjIncludedInSessionSample=0; _hjAbsoluteSessionInProgress=0; _ducprs=eyJMYXN0Q29uc3VsdCI6IjIwMjEtMDktMDcgMTQ6NTg6MjQifQ==; cto_bundle=W1E_LV9HYko5TGdmMEJGRGhVcU45OGozcWdFVkxGZ1FxSERHMEJua1ZpZDVpZ09nZVo3Z01EUyUyQlJxeUJ6OGhFdTc4SEV0YkkxQjFnbmIyUndNNkRmaEQ2TSUyQkhYekZJS1hxNUVlRFUzZ09rQ3R1Y0d0RXBFNThNQmJGJTJCODEwaXlITkEzOUNSdkU5WjBQZnZET0VSSFNVUUpmOUElM0QlM0Q; _ga_HNC8JSM0DG=GS1.1.1631037291.22.1.1631037595.0; _ga=GA1.3.788276172.1604689694; _gat_UA-1814594-78=1"
        },
        referrer: "https://www.cvc.com.br/passagens/v2/search/SAO/SDU?Date1=2021-09-22&Date2=2021-09-25&ADT=1&CHD=0&INF=0&CLA=eco&DIRETO=false",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(req.body),
        method: "post",
        timeout: 0,
        mode: "cors",
    });

    // Setup header for stream
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    });

    // Thread pool
    const pool = workerPool.get();

    let chunkBlock = '';

    // read stream
    for await (const chunk of response.body) {
        chunkBlock = chunkBlock + chunk.toString();

        try {
            // Convert String to JSON (object)
            const { priceGroups } = JSON.parse(chunkBlock);

            // Empty for next loop
            chunkBlock = '';

            if (priceGroups.length > 0) {
                try {
                    // New thread for handle chunk data
                    const data = await pool.saveSearchChunk(sid, priceGroups);
                    res.write(data);
                }
                catch (err) {
                    console.log('Error handleSearchChuck', err);
                }
            }
        } catch (err) {
            // skip this chunk
            // error on json.parse
        }
    }

    // Return search id
    return sid;
}

export default createSearchCache;