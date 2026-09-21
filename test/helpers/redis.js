const redis = require('redis');
const { randomBytes } = require('node:crypto');

// Only this test's random namespace is inspected/deleted; never flush a shared Redis DB.
module.exports = async () => {
    const client = redis.createClient(process.env.REDIS_TEST_URL || 'redis://127.0.0.1:6379', { retry_strategy: () => undefined, connect_timeout: 1000 });
    await new Promise((resolve, reject) => {
        client.once('ready', resolve);
        client.once('error', error => { client.end(true); reject(error); });
    });
    const prefix = `spl:test:${randomBytes(16).toString('hex')}:`;
    const call = (command, ...args) => new Promise((resolve, reject) => client[command](...args, (error, value) => error ? reject(error) : resolve(value)));
    const keys = async () => {
        let cursor = '0', found = [];
        do {
            const result = await call('scan', cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
            cursor = result[0];
            found.push(...result[1]);
        } while (cursor !== '0');
        return [...new Set(found)];
    };
    return { client, prefix, call, keys,
        dump: async () => Promise.all((await keys()).map(async key => [key, await call('type', key) === 'string' ? await call('get', key) : await call('smembers', key)])),
        close: async () => { try { const owned = await keys(); if (owned.length) await call('del', ...owned); } finally { client.end(true); } }
    };
};
