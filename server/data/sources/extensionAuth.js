const { createHash, randomBytes } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const scope = 'soundboard:clips:add';
const lifetime = 15 * 60 * 1000;

class ExtensionAuth {
    constructor(db) {
        this.db = db;
        this.codes = db.collection('extension-login-codes');
        this.grants = db.collection('extension-authorizations');
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
        const expiresAt = Date.now() + lifetime;
        // Code consumption and grant creation are atomic across server instances.
        return this.db.runTransaction(async transaction => {
            const ref = this.codes.doc(hash(code));
            const record = (await transaction.get(ref)).data();
            if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= Date.now() || record.challenge !== challenge || record.redirectUri !== redirectUri || record.audience !== audience) return null;
            transaction.delete(ref);
            transaction.set(this.grants.doc(id), {
                userId: record.userId, tokenHash: hash(token), scope, audience, expiresAt, deleteAfter: new Date(expiresAt), createdAt: Date.now()
            });
            return { access_token: token, token_type: 'Bearer', expires_in: lifetime / 1000, scope };
        });
    }
    async authenticate(token, audience) {
        const match = /^spl_ext_([a-f0-9]{32})\.[a-f0-9]{64}$/.exec(token);
        if (!match || typeof audience !== 'string' || !audience) return null;
        const record = (await this.grants.doc(match[1]).get()).data();
        if (!record || !Number.isFinite(record.expiresAt) || record.tokenHash !== hash(token) || record.scope !== scope || record.audience !== audience || record.expiresAt <= Date.now()) return null;
        return { ...record, id: match[1] };
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
        return records.docs.filter(doc => doc.data().audience === audience && doc.data().expiresAt > Date.now()).map(doc => ({ id: doc.id, expiresAt: doc.data().expiresAt }));
    }
}
module.exports = ExtensionAuth;
