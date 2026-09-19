# Soundboard write authorization

Soundboard mutations require a signed-in soundboard member and the exact site Origin. Legacy Stream Deck query tokens and API keys retain read access only; they no longer authorize add, edit, favorite, or delete. Browsers send Origin automatically for the existing website mutations. Requests with missing or foreign origins are rejected, including the other SPL environment.

POST `/api/soundboard/add` derives `uploadedBy` from the authenticated username (falling back to user ID). Only validated clip fields reach storage. Editing preserves the existing uploader and server metadata and uses the route ID rather than a submitted ID. The unused profile-cookie middleware, which ran before Passport initialization, is removed.

Clip names, descriptions, tags, categories, volume, and source URLs have explicit limits. Audio URLs must use HTTPS on `myinstants.com`, `www.myinstants.com`, or an exact host listed in `SOUNDBOARD_AUDIO_HOSTS` (comma-separated, no wildcards). Configure trusted storage/CDN hosts before deploying if existing custom audio uses them. Arbitrary external and HTTP audio URLs will be rejected on add/edit; existing clips are not modified.

Adding `{name, sourceUrl}` supports Myinstants detail pages. The server fetches only an approved page, bounds HTML to 512 KiB and five seconds, refuses redirects, and checks/pins public DNS addresses at connection time. Extracted audio must still belong to Myinstants. The add operation stores the audio URL; it does not fetch audio bytes. Downstream players/downloaders must enforce their own redirect, DNS, size, and media-type limits when fetching audio.

The Firefox authorization PR builds on these handlers to admit an independently verified, add-only grant. This PR alone does not enable extension bearer authentication. A separate unmerged `/:token/add` proposal must not bypass these restrictions or be merged as-is.

Validation: `npm test` covers session/role/origin guards, forged uploader fields, malformed clips, source-host checks, safe import options, and private/mixed DNS answers, alongside existing read APIs.
