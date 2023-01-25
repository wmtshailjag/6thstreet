const os = require('os');
const path = require('path');
const fs = require('fs');
const NodeCache = require('node-cache');
const DISK_CACHE = require('cacache');

const MEMORY_CACHE = new NodeCache();

// 'CACHE_ACCESS_RECORD' maintains a record of items accessed from the cache.
const CACHE_ACCESS_RECORD = [];

const config = {
    MEMORY_CACHE_MAX_SIZE: 50000000,
    DISK_CACHE_PATH: path.resolve(os.tmpdir(), 'DISK_CACHE')
};

const cache = {
    init: async (options) => {
        const { MEMORY_CACHE_MAX_SIZE, DISK_CACHE_DIRECTORY } = options;

        // Set Memory Cache's Max Size
        if (MEMORY_CACHE_MAX_SIZE) {
            config.MEMORY_CACHE_MAX_SIZE = MEMORY_CACHE_MAX_SIZE;
        }

        // Set Disk Cache path
        if (DISK_CACHE_DIRECTORY) {
            config.DISK_CACHE_PATH = path.resolve(os.tmpdir(), DISK_CACHE_DIRECTORY);
        }

        // When an item is deleted from the Memory Cache, store it in the Disk Cache
        MEMORY_CACHE.on('del', (key, value) => {
            DISK_CACHE.put(config.DISK_CACHE_PATH, key, value);
        });

        return cache.flush();
    },

    get: async (key) => {
        // Try to retreive the item from Memory Cache
        let value = MEMORY_CACHE.get(key);

        // If not found in Memory Cache, check in Disk Cache
        if (!value && await DISK_CACHE.get.info(config.DISK_CACHE_PATH, key)) {
            // If found in Disck Cache, store it in the Memory Cache
            value = (await DISK_CACHE.get(config.DISK_CACHE_PATH, key)).data;
            cache.set(key, value);
        }

        // Update Cache Access Record
        const keyIndexInCacheAccessRecord = CACHE_ACCESS_RECORD.indexOf(key);
        if (keyIndexInCacheAccessRecord >= 0) {
            CACHE_ACCESS_RECORD.splice(keyIndexInCacheAccessRecord, 1);
        }
        CACHE_ACCESS_RECORD.push(key);
        return {
            value
        };
    },

    set: async (key, value) => {
        // Check if Memory Cache is full
        if (MEMORY_CACHE.getStats().vsize >= config.MEMORY_CACHE_MAX_SIZE) {
            // If Memory Cache is full, delete the least recently accessed item
            cache.del(CACHE_ACCESS_RECORD[0])
                .then(() => {
                    CACHE_ACCESS_RECORD.shift();
                    // After the deletion of the least recently accessed item, store the new item in Memory Cache
                    return MEMORY_CACHE.set(key, value);
                })
                .catch((err) => {
                    console.error(`${err}, resetting the entire disk and memory cache`);
                    CACHE_ACCESS_RECORD.length = 0;
                    cache.flush();
                });
        } else {
            // If Memory Cache is not full, store the new item in it
            MEMORY_CACHE.set(key, value);
        }
    },

    // First check if item is in Disk Cache
    del: async (key) => DISK_CACHE.get.info(config.DISK_CACHE_PATH, key).finally((info) => new Promise((resolve, reject) => {
        if (info) {
            // If found in Disk Cache, delete the item from there
            fs.unlink(info.path, (err) => {
                err
                    ? console.error(`Unable to delete item with key: ${key} from disk cache, ${err}`)
                    : DISK_CACHE.rm.entry(config.DISK_CACHE_PATH, key);
            });
        }

        // Finally, delete the item from Memory Cache
        const del = MEMORY_CACHE.del(key);
        if (del) {
            resolve();
        } else {
            reject(`Unable to delete item with key${key} from memory cache`);
        }
    })),

    flush: async () => {
        // First delete all items from Disk Cache
        console.log('Cleaning up disk cache');
        return DISK_CACHE.rm.all(config.DISK_CACHE_PATH)
            .then(() => {
                console.log('Disk cache cleared');
            })
            .catch((err) => {
                console.error(`Unable to clear disk cache: ${err}`);
            })
            .finally(() => {
                // Finally, clear all items from Memory Cache
                if (MEMORY_CACHE) {
                    console.log('Cleaning up memory cache');
                    MEMORY_CACHE.flushAll();
                    MEMORY_CACHE.flushStats();
                    console.log('Memory cache cleared');
                } else {
                    console.log('No memory cache exists');
                }
            });
    },

    close: () => MEMORY_CACHE.close()
};

module.exports = cache;
