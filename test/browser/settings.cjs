// Standalone browser check: real settings UI, session middleware and Redis token store.
// Discord login is replaced by a fixture session; no production services are contacted.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const webpack = require('webpack');
const express = require('express');
const session = require('express-session');
const { chromium } = require('playwright');
const database = require('../helpers/redis');
const { createHash } = require('node:crypto');
const ExtensionAuth = require('../../server/auth/extensionAuth');
const firefox = require('../../server/auth/firefox');
const ApiTokens = require('../../server/auth/apiTokens');

(async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spl-settings-'));
    let redis, server, browser;
    try {
        const entry = path.join(directory, 'entry.tsx');
        fs.writeFileSync(entry, `import React from 'react'; import {Provider} from 'react-redux'; import {store} from ${JSON.stringify(path.resolve('src/state/store'))}; import {fetchUser} from ${JSON.stringify(path.resolve('src/state/reducers/user'))}; import {createRoot} from 'react-dom/client'; import Settings from ${JSON.stringify(path.resolve('src/components/Settings/Settings'))}; import Consent from ${JSON.stringify(path.resolve('src/components/Auth/ExtensionConsent'))}; store.dispatch(fetchUser()); createRoot(document.getElementById('root')).render(<Provider store={store}>{location.pathname === '/extension-consent' ? <Consent/> : <Settings/>}</Provider>);`);
        await new Promise((resolve, reject) => webpack({
            mode: 'development', entry, output: { path: directory, filename: 'bundle.js' },
            resolve: { extensions: ['.tsx', '.ts', '.js'], modules: [path.resolve('node_modules')] },
            module: { rules: [{ test: /\.tsx?$/, use: { loader: require.resolve('ts-loader'), options: { transpileOnly: true, configFile: path.resolve('tsconfig.json') } } }] }
        }, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString())) : resolve()));
        redis = await database();
        const tokens = new ApiTokens(redis.client, redis.prefix);
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        const store = new session.MemoryStore();
        const extensionAuth = new ExtensionAuth(redis.client, store, redis.prefix + 'extension:');
        app.use(session({ store, cookie: { maxAge: 3600000 }, secret: 'browser-fixture', resave: false, saveUninitialized: false }));
        app.use((req, res, next) => { req.user = { id: 'fixture-user', username: 'Fixture member', isSoundboardUser: true }; req.session.passport = { user: req.user }; req.isAuthenticated = () => true; next(); });
        server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
        const origin = `http://127.0.0.1:${server.address().port}`;
        app.locals.origin = origin;
        app.use((req, res, next) => { req.db = { apiTokens: tokens, extensionAuth }; next(); });
        app.get('/api/user', (req, res) => res.json(req.user));
        app.get(['/api/user/lodgeguest', '/api/user/soundboarder'], (req, res) => res.json(true));
        app.use('/login-extension', firefox);
        app.use('/api/user/api-token', require('../../server/api/apiToken'));
        app.use(express.static(directory));
        app.get(['/settings', '/extension-consent'], (req, res) => res.send('<html><body><div id="root"></div><script src="/bundle.js"></script></body></html>'));
        browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
        const page = await browser.newPage();
        page.setDefaultTimeout(15000);
        page.setDefaultNavigationTimeout(15000);
        page.on('dialog', dialog => dialog.accept());
        // Capture the real server redirect without contacting Firefox's external callback host.
        let callback;
        await page.route('**/login-extension/confirm', async route => {
            const response = await route.fetch({ maxRedirects: 0 });
            assert.equal(response.status(), 303);
            callback = new URL(response.headers().location);
            await route.fulfill({ status: 200, contentType: 'text/html', body: 'Connection approved' });
        });
        const verifier = 'v'.repeat(64);
        const params = new URLSearchParams({ redirect_uri: firefox.redirectUri, state: 'a'.repeat(64), code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' });
        await page.goto(origin + '/login-extension?' + params);
        await page.getByRole('button', { name: 'Connect Firefox', exact: true }).click();
        await page.getByText('Connection approved').waitFor();
        assert.equal(callback.origin + callback.pathname, firefox.redirectUri);
        const code = callback.searchParams.get('code');
        assert.ok(code, 'Approval redirects a code to Firefox');
        const grant = await extensionAuth.exchange(code, verifier, firefox.redirectUri, origin);
        assert.ok(grant);
        await page.goto(origin + '/login-extension/connections');
        await page.getByRole('button', { name: /^Revoke Firefox connection/ }).click();
        await page.getByText('No active extension connections.').waitFor();
        assert.equal(await extensionAuth.authenticate(grant.access_token, origin), null);
        assert.equal(await extensionAuth.refresh(grant.refresh_token, origin), null);
        await page.getByText('No active API token.').waitFor();
        await page.getByRole('button', { name: 'Generate token', exact: true }).click();
        const field = page.getByLabel('API token', { exact: true });
        await field.waitFor();
        const first = await field.inputValue();
        assert.ok(await tokens.authenticate(first, origin));
        await page.reload();
        await page.getByRole('button', { name: 'Regenerate token', exact: true }).waitFor();
        assert.equal(await field.count(), 0, 'Reload must not reveal the secret');
        await page.getByRole('button', { name: 'Regenerate token', exact: true }).click();
        await field.waitFor();
        const second = await field.inputValue();
        assert.notEqual(first, second);
        assert.equal(await tokens.authenticate(first, origin), null);
        await page.getByRole('button', { name: 'Revoke token', exact: true }).click();
        await page.getByText('No active API token.').waitFor();
        assert.equal(await tokens.authenticate(second, origin), null);
        console.log('Browser flows passed: Firefox consent and revocation; personal token generation, reload, replacement and revocation.');
    } finally {
        if (browser) await browser.close();
        if (server) await new Promise(resolve => server.close(resolve));
        if (redis) await redis.close();
        fs.rmSync(directory, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
