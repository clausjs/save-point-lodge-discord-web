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
        const filename = require.resolve('../src/components/Settings/Settings.tsx');
        const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
        const compiled = new module.constructor(filename, module);
        compiled.paths = module.paths; compiled._compile(source, filename);
        Settings = compiled.exports.default;
    });
    beforeEach(() => { fetchStub = sinon.stub(global, 'fetch'); });
    afterEach(() => { cleanup(); sinon.restore(); });
    after(() => {
        dom.window.close();
        if (navigatorDescriptor) Object.defineProperty(global, 'navigator', navigatorDescriptor);
        else delete global.navigator;
        delete global.window; delete global.document; delete global.HTMLElement;
        delete global.requestAnimationFrame; delete global.cancelAnimationFrame;
    });
    const reply = body => ({ ok: true, status: 200, json: async () => body });
    it('shows the generated secret once and revokes it with the session CSRF value', async () => {
        fetchStub.onCall(0).resolves(reply({ credential: null, csrf: 'nonce' }));
        fetchStub.onCall(1).resolves(reply({ token: 'test-secret', expiresAt: Date.now() + 86400000 }));
        fetchStub.onCall(2).resolves(reply(null));
        sinon.stub(window, 'confirm').returns(true);
        render(React.createElement(Settings));
        await screen.findByText('No active API token.');
        fireEvent.click(screen.getByText('Generate token'));
        expect((await screen.findByLabelText('API token')).value).to.equal('test-secret');
        expect(fetchStub.secondCall.args[1].headers['X-CSRF-Token']).to.equal('nonce');
        fireEvent.click(screen.getByText('Revoke token'));
        await screen.findByText('No active API token.');
        expect(screen.queryByLabelText('API token')).to.equal(null);
    });
    it('shows a sign-in action for an expired session', async () => {
        fetchStub.resolves({ status: 401 });
        render(React.createElement(Settings));
        expect((await screen.findByText('Sign in to manage your token')).getAttribute('href')).to.equal('/login-discord');
    });
    it('shows load failures without enabling generation', async () => {
        fetchStub.rejects(new Error('offline'));
        render(React.createElement(Settings));
        await screen.findByRole('alert');
        expect(screen.getByText('Generate token').disabled).to.equal(true);
    });
});
