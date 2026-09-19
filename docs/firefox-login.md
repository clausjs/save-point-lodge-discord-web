# Limited Firefox authorization

Firefox reuses the SPL website session/Discord login to request permission to **add soundboard clips only**. No Stream Deck token is handed to the extension, and no client secret is embedded in it. This PR depends on [soundboard write-security PR #10](https://github.com/clausjs/save-point-lodge-discord-web/pull/10); merge/deploy that first.

## Protocol

`GET /login-extension` accepts the fixed Firefox callback, a random state, an S256 challenge, and `code_challenge_method=S256`. It keeps the confirmation in the website session for five minutes. A member with the soundboard role must explicitly approve the session-bound form. Normal Discord callbacks resume the confirmation without a new Discord redirect registration.

Approval issues a 60-second authorization code and redirects to `?code=...&state=...`. The callback contains no access token. The extension POSTs `{grant_type:"authorization_code", code, code_verifier, redirect_uri}` to `/login-extension/token` without website cookies. A Firestore transaction verifies the PKCE challenge, callback, expiry, and SPL origin, consumes the code once, and stores a hashed grant. The response is non-cacheable JSON:

```json
{"access_token":"spl_ext_<grant-id>.<secret>","refresh_token":"spl_refresh_<grant-id>.<secret>","token_type":"Bearer","scope":"soundboard:clips:add","expires_in":900}
```

Access tokens last 15 minutes. Before adding a clip with an expired or nearly expired token, Firefox automatically POSTs `{grant_type:"refresh_token", refresh_token}` to the same token endpoint. Concurrent additions share one renewal. A transaction rotates both secrets, invalidating the previous pair; only their hashes are stored. Refresh secrets remain only in Firefox session storage. A lost rotation response may require reconnecting. Grant and code are bound to the SPL origin, so development grants cannot authorize production even when deployments share a database.

The extension background sends `Authorization: Bearer ...` to `POST /api/soundboard/add`. Bearer requests never fall back to website cookies or legacy API keys. Only this method/path is admitted; all other operations are denied. Every exchange, renewal, and add reads the originating SPL session from the server session store and requires the same authenticated user and an unexpired cookie lifetime. These reads never touch or extend the session. Logout, session deletion, or expiry therefore denies existing access tokens as well as renewal; normal website activity may extend the session. Missing sessions and session-store failures fail closed. Every add also checks grant expiry/revocation and fetches current Discord membership/roles, failing closed if verification fails. The shared hardened handler validates the clip and derives `uploadedBy` from the verified member.

## Revocation

`POST /login-extension/revoke` accepts either the access or refresh credential in the header to revoke its own grant, including after access-token expiry. Firefox calls it before clearing session storage. `/login-extension/connections` lets a signed-in user revoke their own individual grants through a CSRF-protected form without the extension. The grant store checks user ownership and origin inside a transaction. Website/Stream Deck credentials are unaffected.

The Firefox options page gets status only. Content scripts cannot access session storage or invoke auth actions; Myinstants receives no credentials. Old manually entered tokens are no longer used. Playback is not in the grant scope and is rejected locally.

## Deployment

- Keep the manifest ID `soundboard-browser-extension@savepointlodge.com` aligned with the server callback. No arbitrary callback, loopback, or wildcard is accepted.
- Configure `DISCORD_BOT_TOKEN` and `SPL_ID` on the web service for current guild-member lookup. The role ID matches the existing Discord strategy (`1335694712027480175`). Missing configuration denies extension writes.
- The existing backend Firebase account needs read/write access to `extension-login-codes` and `extension-authorizations`. **Only that backend account may read/write these collections.** Do not permit normal client users to create grants. This repository has no deployed Firestore rules to modify; ensure these collections are covered by backend-only rules before release, including removal of any broader rule that would also allow access.
- Authorization codes have a `deleteAfter` timestamp suitable for Firestore TTL cleanup. Renewable grant records deliberately omit it: an old access-token expiry must not delete a connection whose SPL session remains active. Revocation deletes the grant. Inactive session-bound records remain inert; any maintenance cleanup must check the originating session rather than access-token expiry. Never expose stored session IDs to clients.
- `alpha` uses the real Discord/Firebase flow. Local/test mode does not issue dummy grants or fake a soundboard role. Automated tests supply explicit test adapters.

Run `npm test` for atomic redemption, wrong PKCE/callback/origin, expiry, automatic renewal, rotation, logout/session loss, revocation, permissions, and the complete approval → exchange → add → revoke HTTP flow. The companion extension runs `npm run check`. Tests use a transactional Firestore fake and mock Discord; verify deployed Firebase rules and the live Firefox/Discord flow before release.

References: [OAuth security guidance](https://www.rfc-editor.org/rfc/rfc9700.html), [Firefox identity API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity).
