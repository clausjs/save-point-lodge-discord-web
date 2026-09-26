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
const ApiTokens = require('../../server/auth/apiTokens');

(async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'spl-settings-'));
    let redis, server, browser;
    try {
        const entry = path.join(directory, 'entry.tsx');
        fs.writeFileSync(entry, `import React from 'react'; import {createRoot} from 'react-dom/client'; import Settings from ${JSON.stringify(path.resolve('src/components/Settings/Settings'))}; createRoot(document.getElementById('root')).render(<Settings/>);`);
        await new Promise((resolve, reject) => webpack({
            mode: 'development', entry, output: { path: directory, filename: 'bundle.js' },
            resolve: { extensions: ['.tsx', '.ts', '.js'], modules: [path.resolve('node_modules')] },
            module: { rules: [{ test: /\.tsx?$/, use: { loader: require.resolve('ts-loader'), options: { transpileOnly: true, configFile: path.resolve('tsconfig.json') } } }] }
        }, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString())) : resolve()));
        redis = await database();
        const tokens = new ApiTokens(redis.client, redis.prefix);
        const app = express();
        app.use(session({ secret: 'browser-fixture', resave: false, saveUninitialized: false }));
        app.use((req, res, next) => { req.user = { id: 'fixture-user' }; req.isAuthenticated = () => true; next(); });
        server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
        const origin = `http://127.0.0.1:${server.address().port}`;
        app.use('/api/user/api-token', require('../../server/api/apiToken')({ tokens, origin }));
        app.use(express.static(directory));
        app.get('/settings', (req, res) => res.send('<html><body><div id="root"></div><script src="/bundle.js"></script></body></html>'));
        browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
        const page = await browser.newPage();
        page.on('dialog', dialog => dialog.accept());
        await page.goto(origin + '/settings');
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
        console.log('Settings browser flow passed: generate, reload, regenerate, revoke.');
    } finally {
        if (browser) await browser.close();
        if (server) await new Promise(resolve => server.close(resolve));
        if (redis) await redis.close();
        fs.rmSync(directory, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
