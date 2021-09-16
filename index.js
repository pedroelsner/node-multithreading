import os from 'os';
import dotenv from 'dotenv';
dotenv.config();
process.env.UV_THREADPOOL_SIZE = os.cpus().length;


import express from 'express';
import cors from 'cors';

import workerPool from './worker/pool.js';

import createSearchCache from './usecase/createSearchCache.js';
import getSearchCache from './usecase/getSearchCache.js';


const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/pulse', (req, res) => {
    res.send();
})


app.post('/search/async', async (req, res) => {
    try {
        // Stream send paritial response
        const sid = await createSearchCache(req, res);

        // Prepara to send complete response
        const cache = await getSearchCache(sid, {});

        // New thread for JSON.stringify
        const pool = workerPool.get();
        const data = await pool.stringify(cache.body);
        res.write(data);

        res.send();

    } catch (err) {
        console.log(err.message);
        res.sendStatus(500)
    }
});


app.post('/search/filter', async (req, res) => {
    try {
        const { sid, ...body } = req.body;

        if (!sid) {
            throw new Error('request error: sid requided');
        }

        const cache = await getSearchCache(sid, body);
        res.send(cache.body);

    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});


(async () => {
    const workerOptions = { minWorkers: 'max' }
    await workerPool.init(workerOptions)

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`Listening at http://localhost:${PORT}`)
    });
})();

