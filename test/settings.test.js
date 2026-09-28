const { JSDOM } = require('jsdom');
const ts = require('typescript');
const fs = require('fs');
const sinon = require('sinon');

describe('API token settings page', () => {
    let dom, React, render, screen, fireEvent, cleanup, Settings, fetchStub, navigatorDescriptor;
    before(() => {
        dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://savepointlodge.com', pretendToBeVisual: true });
        global.window = dom.window; global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        // Node 18 has no navigator; newer Node versions expose a getter. Use JSDOM in both.
        navigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
        Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
        global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
        global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
        React = require('react');
        ({ render, screen, fireEvent, cleanup } = require('@testing-library/react'));
        require.extensions['.tsx'] = (loaded, filename) => {
            const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
            loaded._compile(source, filename);
        };
        Settings = require('../src/components/Settings/Settings.tsx').default;
    });
    beforeEach(() => { fetchStub = sinon.stub(global, 'fetch');
        fetchStub.withArgs('/login-extension/connections/data').resolves(reply({ connections: [], csrf: 'connection-nonce' })); });
    afterEach(() => { cleanup(); sinon.restore(); });
    after(() => {
        delete require.extensions['.tsx'];
        dom.window.close();
        if (navigatorDescriptor) Object.defineProperty(global, 'navigator', navigatorDescriptor);
        else delete global.navigator;
        delete global.window; delete global.document; delete global.HTMLElement;
        delete global.requestAnimationFrame; delete global.cancelAnimationFrame;
    });
    const reply = body => ({ ok: true, status: 200, json: async () => body });
    it('shows the generated secret once and revokes it with the session CSRF value', async () => {
        fetchStub.withArgs('/api/user/api-token').onCall(0).resolves(reply({ credential: null, csrf: 'nonce' }));
        fetchStub.withArgs('/api/user/api-token').onCall(1).resolves(reply({ token: 'test-secret', expiresAt: Date.now() + 86400000 }));
        fetchStub.withArgs('/api/user/api-token').onCall(2).resolves(reply(null));
        sinon.stub(window, 'confirm').returns(true);
        render(React.createElement(Settings));
        await screen.findByText('No active API token.');
        fireEvent.click(screen.getByText('Generate token'));
        expect((await screen.findByLabelText('API token')).value).to.equal('test-secret');
        expect(fetchStub.withArgs('/api/user/api-token').secondCall.args[1].headers['X-CSRF-Token']).to.equal('nonce');
        fireEvent.click(screen.getByText('Revoke token'));
        await screen.findByText('No active API token.');
        expect(screen.queryByLabelText('API token')).to.equal(null);
    });
    it('shows a sign-in action for an expired session', async () => {
        fetchStub.withArgs('/api/user/api-token').resolves({ status: 401 });
        render(React.createElement(Settings));
        expect((await screen.findByText('Sign in to manage your token')).getAttribute('href')).to.equal('/login-discord');
    });
    it('shows load failures without enabling generation', async () => {
        fetchStub.withArgs('/api/user/api-token').rejects(new Error('offline'));
        render(React.createElement(Settings));
        await screen.findByRole('alert');
        expect(screen.getByText('Generate token').disabled).to.equal(true);
    });
    it('revokes an extension using its session nonce and removes it from Settings', async () => {
        fetchStub.withArgs('/api/user/api-token').resolves(reply({ credential: null, csrf: 'nonce' }));
        fetchStub.withArgs('/login-extension/connections/data').resolves(reply({ connections: [{ id: 'connection-id' }], csrf: 'connection-nonce' }));
        fetchStub.withArgs('/login-extension/connections').resolves(reply(null));
        sinon.stub(window, 'confirm').returns(true);
        render(React.createElement(Settings));
        fireEvent.click(await screen.findByRole('button', { name: 'Revoke Firefox connection connecti' }));
        await screen.findByText('No active extension connections.');
        expect(JSON.parse(fetchStub.withArgs('/login-extension/connections').firstCall.args[1].body)).to.deep.equal({ id: 'connection-id', csrf: 'connection-nonce' });
    });
    it('keeps a connection visible when revocation fails', async () => {
        fetchStub.withArgs('/api/user/api-token').resolves(reply({ credential: null, csrf: 'nonce' }));
        fetchStub.withArgs('/login-extension/connections/data').resolves(reply({ connections: [{ id: 'connection-id' }], csrf: 'nonce' }));
        fetchStub.withArgs('/login-extension/connections').resolves({ ok: false });
        sinon.stub(window, 'confirm').returns(true);
        render(React.createElement(Settings));
        fireEvent.click(await screen.findByRole('button', { name: 'Revoke Firefox connection connecti' }));
        await screen.findByText('Could not revoke the connection. Try again or sign in again.');
        expect(screen.getByText('Firefox · connecti')).not.to.equal(null);
    });
    it('renders consent safely with an approval form and handles expired requests', async () => {
        const Consent = require('../src/components/Auth/ExtensionConsent.tsx').default;
        fetchStub.withArgs('/login-extension/consent').resolves(reply({ username: '<test-user>', csrf: 'consent-nonce' }));
        const view = render(React.createElement(Consent));
        await screen.findByText('<test-user>');
        const button = screen.getByRole('button', { name: 'Connect Firefox' });
        expect(button.closest('form').getAttribute('action')).to.equal('/login-extension/confirm');
        expect(button.closest('form').querySelector('[name=csrf]').value).to.equal('consent-nonce');
        expect(screen.getByRole('button', { name: 'Cancel' }).value).to.equal('deny');
        view.unmount();
        fetchStub.withArgs('/login-extension/consent').resolves({ ok: false });
        render(React.createElement(Consent));
        await screen.findByRole('alert');
        expect(screen.queryByRole('button', { name: 'Connect Firefox' })).to.equal(null);
    });
});
