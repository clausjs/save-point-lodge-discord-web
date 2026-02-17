const https = require("https");
const router = require('express').Router();

class ArcDB {
    baseUrl = 'https://metaforge.app/api/arc-raiders';
    redisClient;
    lastFetch;

    constructor(redisClient) {
        this.redisClient = redisClient;
        redisClient.get('arcdb_all_item_cache', (err, data) => {
            if (err) {
                console.error('Error fetching item cache from Redis:', err);
            } else if (data) {
                try {
                    this.itemCache = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing item cache from Redis:', e);
                }
            }
        });
    }
    _getFromCache(id = undefined) {
        if (!id) {
            this.redisClient.get('arcdb_all_items_cache', (err, data) => {
                if (err) {
                    console.error('Error fetching all items cache from Redis:', err);
                }
                
                return JSON.parse(data);
            });
        } else {
            this.redisClient.get(`arcdb_item_cache:${id}`,(err, data) => {
                if (err) {
                    console.error(`Error fetching item ${id} cache from Redis:`, err);
                }
                
                return JSON.parse(data);
            });
        }
    }
    _setAllItemsCache(data) {
        this.redisClient.set('arcdb_all_items_cache', JSON.stringify(data), (err) => {
            if (err) {
                console.error('Error setting all items cache in Redis:', err);
            }
        });
    } 
    _setItemCache(key, data) {
        this.redisClient.set(`arcdb_item_cache:${key}`, JSON.stringify(data), (err) => {
            if (err) {
                console.error(`Error setting item ${key} cache in Redis:`, err);
            }
        });
    }
    async getAllItems() {
        return new Promise(async (resolve, reject) => {
            let allItems = await this._getFromCache() ?? [];
            if (allItems.length > 0) {
                console.log(`Fetched all ${allItems.length} items from ArcDB cache.`);
                return resolve(allItems);
            }

            const { totalPages, items: firstPageItems } = await new Promise((resolve, reject) => {
                https.get(`${this.baseUrl}/items?limit=100&page=0`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            resolve({ totalPages: response.pagination.totalPages, items: response.data });
                        } catch (e) {
                            console.error('Error parsing page 1 items from ArcDB:', e);
                        }
                    });
                }).on('error', (err) => {
                    console.error('Error fetching page 1 items from ArcDB:', err);
                    reject(err);
                });
            });

            allItems = [];
            allItems.push(...firstPageItems);

            let page = 1;
            const tasks = [];
            while (page < totalPages) {
                tasks.push(new Promise((resolve, reject) => {
                    https.get(`${this.baseUrl}/items?limit=100&page=${page}`, (res) => {
                        let data = '';
                        res.on('data', (chunk) => {
                            data += chunk;
                        });
                        res.on('end', () => {
                            try {
                                const response = JSON.parse(data);
                                resolve(response.data);
                            } catch (e) {
                                console.error(`Error parsing page ${page} items from ArcDB:`, e);
                            }
                        });
                    }).on('error', (err) => {
                        console.error(`Error fetching page ${page} items from ArcDB:`, err);
                        reject(err);
                    });
                }));
                page++;
            }

            try {
                const remainingItems = await Promise.all(tasks);
                remainingItems.forEach(items => allItems.push(...items));
                console.log(`Fetched all ${allItems.length} items from ArcDB across ${totalPages} pages.`);

                this._setAllItemsCache(allItems);
                resolve(allItems);
            } catch (error) {
                console.error('Error fetching remaining item pages from ArcDB:', error);
                reject(error);
            }
        });
    }
    async getItemById(id) {
        return new Promise(async (resolve, reject) => {
            console.log(`Fetching item with ID ${id} from ArcDB...`);
            const cachedItem = this._getFromCache(id);
            if (cachedItem) {
                console.log(`Fetched item ${id} from ArcDB cache`, cachedItem);
                return resolve(cachedItem);
            }
            
            https.get(`${this.baseUrl}/items?id=${id}&includeComponents=true`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', async () => {
                    try {
                        const response = JSON.parse(data);
                        this._setItemCache(id, response.data[0]);
                        resolve(response.data[0]);
                    } catch (e) {
                        console.error(`Error parsing item with ID ${id} from ArcDB:`, e);
                        resolve(null);
                    }
                });
            }).on('error', (err) => {
                console.error(`Error fetching item with ID ${id} from ArcDB:`, err);
                reject(err);
            });
        });
    }
}

let arcDBInstance;
const initializeArcDB = (redisClient) => {
    if (!arcDBInstance && redisClient) {
        arcDBInstance = new ArcDB(redisClient);
    }
    return arcDBInstance;
}

router.get('/items', async (req, res) => {
    if (req.isTesting) {
        console.log('returning static json for arcdb', req.isTesting);
        const items = await new Promise(async (resolve) => {
            const slowResponse = setTimeout(() => {
                clearTimeout(slowResponse);
                resolve(require('./testData/items.json'));
            }, 5000);
        });
        return res.status(200).json(items);
    }

    const arcDBInstance = initializeArcDB(req.redisClient);

    try {
        const items = await arcDBInstance?.getAllItems();
        res.status(200).json(items);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch items from ArcDB' });
    }
});

router.get('/items/:id', async (req, res) => {
    if (req.isTesting) {
        const testDetailData = require('./testData/advanced_electrical_components.json');
        const detailMatch = testDetailData.find((item) => item.id === req.params.id) || testDetailData[0];
        if (detailMatch) return res.status(200).json(detailMatch);
    }

    const arcDBInstance = initializeArcDB(req.redisClient);

    const itemId = req.params.id;
    try {
        const item = await arcDBInstance?.getItemById(itemId);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ error: 'Item not found in ArcDB' });
        }
    } catch (e) {
        res.status(500).json({ error: `Failed to fetch item with ID ${itemId} from ArcDB` });
    }
});

module.exports = router;