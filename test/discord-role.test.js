const sinon = require('sinon');
const Strategy = require('../server/auth/DiscordStrategy');

describe('Discord login soundboard role', () => {
    afterEach(() => sinon.restore());
    for (const [role, allowed] of [['configured-role', true], ['different-role', false], [undefined, false]]) {
        it(`sets soundboard access to ${allowed} with role configuration ${role}`, async () => {
            const env = { ...process.env, SPL_ID: 'guild' };
            delete env.SOUNDBOARD_ROLE_ID;
            if (role) env.SOUNDBOARD_ROLE_ID = role;
            sinon.stub(process, 'env').value(env);
            const strategy = new Strategy({ clientID: 'test', clientSecret: 'test', authorizationURL: 'https://discord.com/oauth2/authorize', tokenURL: 'https://discord.com/api/oauth2/token' }, () => {});
            sinon.stub(strategy, 'checkScope').callsFake((scope, token, callback) => callback(null, scope === 'guilds' ? [{ id: 'guild' }] : []));
            sinon.stub(strategy._oauth2, 'get').callsFake((url, token, callback) => callback(null, JSON.stringify(url.endsWith('/member') ? { roles: ['configured-role'] } : { id: 'user' })));
            const profile = await new Promise((resolve, reject) => strategy.userProfile('test-token', (error, profile) => error ? reject(error) : resolve(profile)));
            expect(profile.isSoundboardUser).to.equal(allowed);
        });
    }
});
