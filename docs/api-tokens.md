# Personal API tokens

Settings also lists Firefox extension connections with individual revocation controls. Revoking a connection stops both its access token and renewal.

Open **Account → Settings** (`/settings`) while signed in to generate a personal token. Copy the secret immediately: it is shown only in that response and held in page memory. Reloading shows only its expiry. Regenerate replaces the previous token immediately; revoke removes it. Each account has one token per SPL environment.

Tokens expire after 90 days, independently of the browser session. Signing out does not revoke them and there is no refresh endpoint. Redis stores a SHA-256 hash, owner, audience, scope and timestamps under `spl:api-token:` with a 90-day TTL. Redis loss invalidates tokens; persistence uses the deployment's existing Redis configuration.

Send `Authorization: Bearer YOUR_TOKEN` over HTTPS. Personal tokens have `api:user` scope on the existing user, commands, giphy, status, discord, soundboard, download and arcdb API routers. The server loads current Discord membership on every request; soundboard writes additionally require the configured soundboard role. Tokens cannot mint more tokens or retrieve Stream Deck credentials. Missing membership returns 403; expired/revoked credentials return 401; unavailable Redis/Discord returns 503. A failed bearer request never falls back to a cookie or API key. Cookie-only browsing does not invoke bearer verification.

## Management endpoints

All `/api/user/api-token` endpoints require an authenticated website session, reject Authorization headers, and return `Cache-Control: no-store`.

- `GET`: returns `{ credential: { createdAt, expiresAt } | null, csrf }`. Timestamps are Unix milliseconds; the secret is never returned here.
- `POST`: requires the exact SPL `Origin` and `X-CSRF-Token` from GET. Creates/replaces the caller's token, returning status 201 and `{ token, createdAt, expiresAt }`.
- `DELETE`: requires the same Origin/CSRF checks; revokes the caller's token and returns 204.

No caller-supplied user ID is accepted. The CSRF value belongs to the website session. Session credentials, not bearer tokens, authorize management.

## Code map

Route files instantiate an Express router, define their routes, and export the router directly. Application middleware supplies `req.db`, matching the existing API routes. `app.locals.origin` holds the configured SPL origin for credential audiences and Origin checks; it is never derived from request headers.

`auth/apiTokens.js` owns Redis persistence. `auth/bearer.js` authenticates both personal and Firefox credentials and assigns `req.user` and `req.auth`; it never dispatches a clip handler or turns a bearer into a Passport session. `auth/permission.js` enforces allowed scopes at route boundaries. `auth/soundboard.js` enforces the soundboard role and cookie-request Origin protection. The clip route invokes its own handler normally.

Firefox authorization remains in `auth/firefox.js` and `auth/extensionAuth.js`: its credentials are session-bound, renewable, and limited to `POST /api/soundboard/add`. Personal tokens do not change that protocol. See [Firefox login](firefox-login.md).

Run `REDIS_TEST_URL=redis://127.0.0.1:6379 npm test` for real Redis lifecycle tests, management/permission HTTP tests and React settings functional tests. Local mock mode does not provision Redis credentials; use an environment with the real session, Redis and Discord configuration for live testing.

For the browser flow, run `npx playwright install chromium` then `REDIS_TEST_URL=redis://127.0.0.1:6379 npm run test:browser`. This bundles the actual settings component and mounts the real management router against an isolated Redis namespace with a fixture website session. It verifies generation, secret disappearance on reload, replacement and revocation without contacting Discord. Live Discord sign-in still needs deployment verification.
