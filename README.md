A single page react-router based application which connects to Discord.js and Google Firebase to retrieve information about users of the Save Point Lodge Discord.

# Configuring
Create a `.env` file with environment variables. The running server use these files (and thus are required for building for Docker deployment as well).

A `PORT` var is required for any non-testing environment or the app will always start on 3000 (but the prod docker-compose is expecting 8080).

Different env can be `docker-composed`'ed with:

- dev: docker compose -f docker-compose.yml -f docker-compose.dev.yml up
- prod: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Running

1. To start `cd` into project directory
2. Install node modules with `npm i`
3. Run the project with `npm run start`, this will webpack the directories and run the server
4. Browser your server at `http://localhost:3000`

# Self-signed certs for testing
`mkdir certs`
`openssl req -x509 -newkey rsa:4096 -keyout certs/savepointlodge.com.key -out certs/savepointlodge.com.pem -sha256 -days 365 -nodes`

# Adding soundboard clips with a Stream Deck token

`POST /api/soundboard/:token/add` accepts the same JSON clip payload as `/api/soundboard/add` (for example, `{"name":"Hello","url":"https://example.com/hello.mp3"}`). The token is looked up in Firebase `stream-deck-authorizations`, then its user ID is resolved to a member of `SPL_ID` through Discord. Configure `DISCORD_BOT_TOKEN` with a bot token for that guild.

The route sets `uploadedBy` to the member's Discord username and returns the submitted clip with HTTP 200, matching the normal add route. Unknown tokens return 401, missing guild members return 403, and lookup or save failures return 500. No session or additional API key is required.
