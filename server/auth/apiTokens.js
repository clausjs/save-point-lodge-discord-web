const { createHash, randomBytes } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const lifetime = 90 * 24 * 60 * 60;

// One personal token per user/environment. SET atomically replaces the previous token;
// only its hash is retained, so the secret can be shown only in the generation response.
class ApiTokens {
    constructor(client, prefix = 'spl:api-token:') { this.client = client; this.prefix = prefix; }
    call(command, ...args) {
        if (!this.client) return Promise.reject(new Error('Redis is not configured.'));
        return new Promise((resolve, reject) => this.client[command](...args, (error, result) => error ? reject(error) : resolve(result)));
    }
    id(userId, audience) { return hash(JSON.stringify([userId, audience])); }
    metadata(record) { return record ? { createdAt: record.createdAt, expiresAt: record.expiresAt } : null; }
    async generate(userId, audience) {
        const id = this.id(userId, audience);
        const token = `spl_api_${id}.${randomBytes(32).toString('hex')}`;
        const record = { userId, audience, scope: 'api:user', tokenHash: hash(token), createdAt: Date.now(), expiresAt: Date.now() + lifetime * 1000 };
        await this.call('set', this.prefix + id, JSON.stringify(record), 'EX', lifetime);
        return { token, ...this.metadata(record) };
    }
    async authenticate(token, audience) {
        const id = /^spl_api_([a-f0-9]{64})\.[a-f0-9]{64}$/.exec(token)?.[1];
        if (!id || !audience) return null;
        const record = JSON.parse(await this.call('get', this.prefix + id));
        return record && record.audience === audience && record.scope === 'api:user' && record.tokenHash === hash(token)
            && Number.isFinite(record.expiresAt) && record.expiresAt > Date.now() ? record : null;
    }
    async get(userId, audience) {
        const record = JSON.parse(await this.call('get', this.prefix + this.id(userId, audience)));
        return record && record.expiresAt > Date.now() ? this.metadata(record) : null;
    }
    async revoke(userId, audience) { await this.call('del', this.prefix + this.id(userId, audience)); }
}
module.exports = ApiTokens;
