# Firefox soundboard login

The Firefox extension can reuse the Discord login flow to receive the authenticated user's existing soundboard token (the same credential used by Stream Deck). This change is based on the `dev` tag on branch `2.9.0`.

## Flow

- The extension opens `/login-extension?redirect_uri=<Firefox callback>&state=<64 hex characters>` using Firefox's `identity.launchWebAuthFlow`.
- The server accepts only the callback derived from `soundboard-browser-extension@savepointlodge.com`, stores the request in the session for five minutes, and starts the existing `/login-discord` flow if needed.
- `/login-redirect` verifies Discord OAuth state and resumes `/login-extension/confirm` for pending extension logins. Normal website logins still go to `/postAuth`; Stream Deck keeps its existing routes.
- Confirmation requires a signed-in user with `isSoundboardUser === true` and a session-bound CSRF nonce. The user sees the account and chooses Connect Firefox or Cancel.
- Approval fetches `db.firebase.streamdeck.get(req.user.id)`. A redirect to the fixed Firefox callback carries `#state=...&token=...`. Cancellation carries `#state=...&error=access_denied`. Confirmation pages are not cacheable or frameable and do not contain credentials.
- Firefox validates the callback and state and stores the token for the selected environment. The fragment is not sent in an HTTP request to the callback host.

This is an explicit handoff of the existing credential, not a new OAuth token issuer or authorization-code/PKCE service. Existing token permissions and lifetime apply. Removing the token from Firefox does not revoke it, and the existing Stream Deck token is not rotated. The plugin's proposed add/play endpoints are outside this change.

## Deployment and verification

No new Discord callback URL or client secret is needed. Both environments continue using their existing `/login-redirect` registration. Keep the server's fixed add-on ID aligned with the companion Firefox manifest. The `alpha` deployment uses real Discord/Firebase authentication; local `dev`/test mode does not fake authorization for this route or issue a dummy credential.

Run `npm test` for HTTP coverage of confirmation, membership checks, state and callback validation, expiry, cancellation, retrieval failures, and browser routing. Run `npm run check` in the companion Firefox repository.

After deploying to development, load the companion extension in Firefox, choose Development, and click Log in with Savepoint Lodge. Verify signed-out and already-signed-in flows, approve access, and confirm settings shows a stored token without displaying it. Repeat with cancellation and a non-soundboard account. Verify normal website and Stream Deck login, then test Production separately. Automated tests mock Discord and token storage; a live Discord/Firefox smoke test is still required.

References: [Firefox identity API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity), [Firefox callback derivation](https://github.com/mozilla/gecko-dev/blob/master/toolkit/components/extensions/child/ext-identity.js).
