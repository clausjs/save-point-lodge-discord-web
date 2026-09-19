const { createHash, randomBytes } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const scope = 'soundboard:clips:add';
const lifetime = 15 * 60 * 1000;

class ExtensionAuth {
    constructor(db) {
        this.sessionStore = null;
        this.db = db;
        this.codes = db.collection('extension-login-codes');
        this.grants = db.collection('extension-authorizations');
    }
    async activeSession(record) {
        if (!record?.sessionId || !this.sessionStore) return false;
        // Read only: extension activity must not touch or prolong the website session.
        const session = await new Promise((resolve, reject) => this.sessionStore.get(record.sessionId, (error, value) => error ? reject(error) : resolve(value)));
        return session?.passport?.user?.id === record.userId && new Date(session.cookie?.expires).getTime() > Date.now();
    }
    async issueCode(details) {
        const code = randomBytes(32).toString('hex');
        await this.codes.doc(hash(code)).set({ ...details, expiresAt: Date.now() + 60000, deleteAfter: new Date(Date.now() + 60000) });
        return code;
    }
    async exchange(code, verifier, redirectUri, audience) {
        if (typeof audience !== 'string' || !audience || !/^[a-f0-9]{64}$/.test(code) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return null;
        const challenge = createHash('sha256').update(verifier).digest('base64url');
        const id = randomBytes(16).toString('hex');
        const token = `spl_ext_${id}.${randomBytes(32).toString('hex')}`;
        const refreshToken = `spl_refresh_${id}.${randomBytes(32).toString('hex')}`;
        const expiresAt = Date.now() + lifetime;
        // Code consumption and grant creation are atomic across server instances.
        return this.db.runTransaction(async transaction => {
            const ref = this.codes.doc(hash(code));
            const record = (await transaction.get(ref)).data();
            if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= Date.now() || record.challenge !== challenge || record.redirectUri !== redirectUri || record.audience !== audience || !await this.activeSession(record)) return null;
            transaction.delete(ref);
            transaction.set(this.grants.doc(id), {
                userId: record.userId, sessionId: record.sessionId, tokenHash: hash(token), refreshHash: hash(refreshToken), scope, audience, expiresAt, createdAt: Date.now()
            });
            return { access_token: token, refresh_token: refreshToken, token_type: 'Bearer', expires_in: lifetime / 1000, scope };
        });
    }
    async authenticate(token, audience) {
        const match = /^spl_ext_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match || typeof audience !== 'string' || !audience) return null;
        const record = (await this.grants.doc(match[1]).get()).data();
        if (!record || !Number.isFinite(record.expiresAt) || record.tokenHash !== hash(token) || record.scope !== scope || record.audience !== audience || record.expiresAt <= Date.now() || !await this.activeSession(record)) return null;
        return { ...record, id: match[1] };
    }
    async refresh(token, audience) {
        const match = /^spl_refresh_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match || !audience) return null;
        return this.db.runTransaction(async transaction => {
            const ref = this.grants.doc(match[1]);
            const record = (await transaction.get(ref)).data();
            if (!record || record.refreshHash !== hash(token) || record.audience !== audience || record.scope !== scope || !await this.activeSession(record)) return null;
            const access = `spl_ext_${match[1]}.${randomBytes(32).toString('hex')}`;
            const refresh = `spl_refresh_${match[1]}.${randomBytes(32).toString('hex')}`;
            transaction.set(ref, { ...record, tokenHash: hash(access), refreshHash: hash(refresh), expiresAt: Date.now() + lifetime });
            return { access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: lifetime / 1000, scope };
        });
    }
    async revokeRefresh(token, audience) {
        const match = /^spl_refresh_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match) return;
        await this.db.runTransaction(async transaction => {
            const ref = this.grants.doc(match[1]);
            const record = (await transaction.get(ref)).data();
            if (record?.refreshHash === hash(token) && record.audience === audience) transaction.delete(ref);
        });
    }
    async revoke(id, userId, audience) {
        if (!/^[a-f0-9]{32}$/.test(id)) return;
        await this.db.runTransaction(async transaction => {
            const ref = this.grants.doc(id);
            const record = (await transaction.get(ref)).data();
            if (record?.userId === userId && record.audience === audience) transaction.delete(ref);
        });
    }
    async list(userId, audience) {
        const records = await this.grants.where('userId', '==', userId).get();
        const active = await Promise.all(records.docs.map(async doc => doc.data().audience === audience && await this.activeSession(doc.data()) ? { id: doc.id, expiresAt: doc.data().expiresAt } : null));
        return active.filter(Boolean);
    }
}
module.exports = ExtensionAuth;
