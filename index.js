import os from 'os';
import dotenv from 'dotenv';
dotenv.config();
process.env.UV_THREADPOOL_SIZE = os.cpus().length;


import express from 'express';
import cors from 'cors';
import { Client } from '@elastic/elasticsearch';

import nanoid from './utils/nanoid.js';

import fetchSearchAsync from './service/fetchSearchAsync.js';
import getSearchCache from './usecase/getSearchCache.js';


const elastic = new Client({ node: 'http://localhost:9200' });

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Define 'searchId'
app.use(async (req, res, next) => {
    res.locals.searchId = req.body.search.id || (await nanoid());
    next();
});


app.post('/search/async', async (req, res) => {
    try {
        await fetchSearchAsync(req, res, elastic);
        res.send();

    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
});

app.post('/seach/filter', async (req, res) => {
    try {
        const response = await getSearchCache(req, res, elastic);
        res.send(response.body.hits);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});



const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
});
