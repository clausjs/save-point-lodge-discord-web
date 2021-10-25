const WEB_COLLECTION_NAME = "WEB";
const MOVIES_COLLECTION_NAME = "movies";
const USER_OPTS_COLLECTION = "user_options";
const USER_OPTS_COLLECTION_DESCRIPTIONS = "descriptions";
const COMMANDS_COLLECTION = "commands";


const MOVIEGOERS = "moviegoers";

class FirebaseData {
    constructor(store) {
        this.db = store;
    }
    #logErr = (err) => {
        console.error(err);
    }
    #getMovies = async () => {
        const { db } = this;

        return await db.collection(MOVIES_COLLECTION_NAME).orderBy('posted').get();
    }
    #getMoviegoers = async () => {
        const { db } = this;

        try {
            const response = await db.collection(WEB_COLLECTION_NAME).doc(MOVIEGOERS).get('users');
            const moviegoers = response.data();
            return moviegoers.users;
        } catch (err) {
            this.#logErr(err);
            return [];
        }
    }
    #getUnwatchedMovies = async (userId = null) => {
        try {
            const moviesResponse = await this.#getMovies();

            let movies = {};
            moviesResponse.forEach(resMovie => {
                let movie = resMovie.data();
                if ((!userId || (!movie.voted || !Object.keys(movie.voted).includes(userId))) && !movie.watched) {
                    movies[resMovie.id] = movie;
                }
            });
            return movies;
        } catch (err) {
            this.#logErr(err);
            return [];
        }
    }
    #getMoviegoerCount = async () => {
        const userList = await this.#getMoviegoers();
        return userList.length;
    }
    #buildOptsWithDescriptions = (options, descriptions) => {
        const opts = {};

        Object.keys(options).map(key => {
            if (options.hasOwnProperty(key)) {
                opts[key] = {
                    value: options[key],
                    description: descriptions[key] || null
                };
            }
        });

        return opts;
    }
    getVotedMovies = async (userId) => {
        if (!userId) return this.#logErr(new Error("No userId supplied to 'getVotedMovies'"));

        try {
            const moviesResponse = await this.#getMovies();

            let movies = {};
            moviesResponse.forEach(movieRes => {
                let movie = movieRes.data();
                if (movie.voted && Object.keys(movie.voted).includes(userId) && !movie.watched) {
                    movies[movieRes.id] = movie;
                }
            })
            return movies;
        } catch (err) {
            this.#logErr(err);
            return [];
        }
    }
    isMoviegoer = async (userId) => {
        if (!userId) return this.#logErr(new Error("No userId supplied to isMoviegoer"));

        const userList = await this.#getMoviegoers();
        return userList.includes(userId);
    }
    getUnvotedMovies = async (userId) => {
        if (!userId) return this.#logErr(new Error("No userId supplied to getUnvotedMovies"));

        const movies = await this.#getUnwatchedMovies(userId);
        return movies;
    }
    getVotedMovieStatistics = async (userId) => {
        if (!userId) return this.#logErr(new Error('No userId supplied to getVotedMovieStatistics'));
        try {
            const movies = await this.getVotedMovies(userId);
            const total = await this.#getMoviegoerCount();
            return {
                movies,
                totalMoviegoers: total
            };
        } catch (err) {
            this.#logErr(err);
            return {};
        }
    }
    addVote = async (userId, movieId) => {
        const { db } = this;
        const collection = db.collection(MOVIES_COLLECTION_NAME);
        const getMovieResponse = await collection.doc(movieId).get();
        const movie = getMovieResponse.data();

        movie.voted[userId] = true;
        return await collection.doc(movieId).update(movie);
    }
    getCommands = async () => {
        const { db } = this;
        const collection = db.collection(COMMANDS_COLLECTION);
        const getCommandsResponse = await collection.get();

        const commands = [];
        getCommandsResponse.forEach(res => {
            const command = res.data();

            if (res.id.indexOf('_input') === -1) {
                commands.push(command);
            }
        });
        return commands;
    }
    getUserOptions = async (userId) => {
        if (!userId) return this.#logErr(new Error("No userId supplied to getUserOptions"));

        const { db } = this;

        try {
            const optsResponse = await db.collection(USER_OPTS_COLLECTION).doc(userId).get();
            const descriptionsResponse = await db.collection(USER_OPTS_COLLECTION).doc(USER_OPTS_COLLECTION_DESCRIPTIONS).get();
            const descriptions = descriptionsResponse.data();
    
            const options = optsResponse.data();
            return this.#buildOptsWithDescriptions(options, descriptions);
        } catch (err) {
            this.#logErr(err);
            return {};
        }
    }
    setUserOption = async (userId, option) => {
        if (!userId) return this.#logErr(new Error("No userId supplied to setUserOption"));
        if (!option) return this.#logErr(new Error("No option supplied"));

        const { db } = this;

        console.log('option: ', option);

        try {
            await db.collection(USER_OPTS_COLLECTION).doc(userId).update(option);
            const optsResponse = await db.collection(USER_OPTS_COLLECTION).doc(userId).get();
            const descriptionsResponse = await db.collection(USER_OPTS_COLLECTION).doc(USER_OPTS_COLLECTION_DESCRIPTIONS).get();
            return this.#buildOptsWithDescriptions(optsResponse.data(), descriptionsResponse.data());
        } catch (err) {
            this.#logErr(err);
        }
    }
}

module.exports = (store) => {
    const instance = new FirebaseData(store);
    Object.freeze(instance);
    return instance;
}