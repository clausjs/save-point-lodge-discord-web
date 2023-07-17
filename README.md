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
