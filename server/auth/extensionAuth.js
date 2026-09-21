const { createHash, randomBytes } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const scope = 'soundboard:clips:add';
const lifetime = 15 * 60 * 1000;

// Compare the exact record read by this request before consuming, rotating, or deleting it.
// This keeps concurrent requests atomic without WATCH state on the shared Redis client.
const update = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
if ARGV[2] == '' then
    redis.call('DEL', KEYS[1])
    redis.call('SREM', KEYS[3], ARGV[3])
else
    redis.call('SET', KEYS[2], ARGV[2])
    redis.call('SADD', KEYS[3], ARGV[3])
    if KEYS[1] ~= KEYS[2] then redis.call('DEL', KEYS[1]) end
end
return 1`;

class ExtensionAuth {
    constructor(client, sessionStore, prefix = 'spl:extension:') {
        this.client = client;
        this.sessionStore = sessionStore;
        this.prefix = prefix;
    }
    call(command, ...args) {
        if (!this.client) return Promise.reject(new Error('Redis authorization storage is not configured.'));
        return new Promise((resolve, reject) => this.client[command](...args, (error, result) => error ? reject(error) : resolve(result)));
    }
    grantKey(id) { return `${this.prefix}grant:${id}`; }
    ownerKey(record) { return `${this.prefix}owner:${hash(JSON.stringify([record.audience, record.userId]))}`; }
    async activeSession(record) {
        if (!record?.sessionId || !this.sessionStore) return false;
        // Read only: extension activity must not touch or prolong the website session.
        const session = await new Promise((resolve, reject) => this.sessionStore.get(record.sessionId, (error, value) => error ? reject(error) : resolve(value)));
        return session?.passport?.user?.id === record.userId && new Date(session.cookie?.expires).getTime() > Date.now();
    }
    async replace(key, raw, id, record, replacement) {
        return this.call('eval', update, 3, key, this.grantKey(id), this.ownerKey(record), raw, replacement ? JSON.stringify(replacement) : '', id);
    }
    credentials(id) {
        return { access_token: `spl_ext_${id}.${randomBytes(32).toString('hex')}`, refresh_token: `spl_refresh_${id}.${randomBytes(32).toString('hex')}`, token_type: 'Bearer', expires_in: lifetime / 1000, scope };
    }
    secrets(credentials) {
        return { tokenHash: hash(credentials.access_token), refreshHash: hash(credentials.refresh_token), expiresAt: Date.now() + lifetime };
    }
    async issueCode(details) {
        const code = randomBytes(32).toString('hex');
        await this.call('set', `${this.prefix}code:${hash(code)}`, JSON.stringify({ ...details, expiresAt: Date.now() + 60000 }), 'EX', 60);
        return code;
    }
    async exchange(code, verifier, redirectUri, audience) {
        if (typeof audience !== 'string' || !audience || !/^[a-f0-9]{64}$/.test(code) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return null;
        const key = `${this.prefix}code:${hash(code)}`;
        const raw = await this.call('get', key);
        const record = JSON.parse(raw);
        const challenge = createHash('sha256').update(verifier).digest('base64url');
        if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= Date.now() || record.challenge !== challenge || record.redirectUri !== redirectUri || record.audience !== audience || !await this.activeSession(record)) return null;
        const id = randomBytes(16).toString('hex');
        const credentials = this.credentials(id);
        const grant = { userId: record.userId, sessionId: record.sessionId, audience, scope, createdAt: Date.now(), ...this.secrets(credentials) };
        return await this.replace(key, raw, id, record, grant) ? credentials : null;
    }
    async authenticate(token, audience) {
        const match = /^spl_ext_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match || typeof audience !== 'string' || !audience) return null;
        const record = JSON.parse(await this.call('get', this.grantKey(match[1])));
        if (!record || !Number.isFinite(record.expiresAt) || record.tokenHash !== hash(token) || record.scope !== scope || record.audience !== audience || record.expiresAt <= Date.now() || !await this.activeSession(record)) return null;
        return { ...record, id: match[1] };
    }
    async refresh(token, audience) {
        const match = /^spl_refresh_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match || !audience) return null;
        const key = this.grantKey(match[1]);
        const raw = await this.call('get', key);
        const record = JSON.parse(raw);
        if (!record || record.refreshHash !== hash(token) || record.audience !== audience || record.scope !== scope || !await this.activeSession(record)) return null;
        const credentials = this.credentials(match[1]);
        return await this.replace(key, raw, match[1], record, { ...record, ...this.secrets(credentials) }) ? credentials : null;
    }
    async revokeRefresh(token, audience) {
        const match = /^spl_refresh_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match) return;
        const key = this.grantKey(match[1]);
        const raw = await this.call('get', key);
        const record = JSON.parse(raw);
        if (record?.refreshHash === hash(token) && record.audience === audience) await this.revoke(match[1], record.userId, audience);
    }
    async revoke(id, userId, audience) {
        if (!/^[a-f0-9]{32}$/.test(id)) return;
        const key = this.grantKey(id);
        const raw = await this.call('get', key);
        const record = JSON.parse(raw);
        if (record?.userId === userId && record.audience === audience) {
            // Owner revocation must win even if a refresh rotated the secrets after our read.
            await new Promise((resolve, reject) => this.client.multi().del(key).srem(this.ownerKey(record), id).exec(error => error ? reject(error) : resolve()));
        }
    }
    async list(userId, audience) {
        const ids = await this.call('smembers', this.ownerKey({ userId, audience }));
        const active = await Promise.all(ids.map(async id => {
            const record = JSON.parse(await this.call('get', this.grantKey(id)));
            return record?.userId === userId && record.audience === audience && await this.activeSession(record) ? { id, expiresAt: record.expiresAt } : null;
        }));
        return active.filter(Boolean);
    }
    async cleanup() {
        let cursor = '0';
        do {
            const result = await this.call('scan', cursor, 'MATCH', `${this.prefix}grant:*`, 'COUNT', 100);
            cursor = result[0];
            for (const key of result[1]) {
                const raw = await this.call('get', key);
                const record = JSON.parse(raw);
                if (record && !await this.activeSession(record)) await this.replace(key, raw, key.slice(`${this.prefix}grant:`.length), record, null);
            }
        } while (cursor !== '0');
    }
}
module.exports = ExtensionAuth;
