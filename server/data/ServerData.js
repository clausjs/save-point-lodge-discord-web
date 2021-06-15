const COLLECTION_NAME = "WEB";
const WEB_MOVIEGOERS_DOC = "moviegoers";

const MOVIES_COLLECTION = "movies";

class ServerData {
    constructor(store) {
        this.db = store;
    }
    #getMoviegoerIds = async () => {
        const { db } = this;

        try {
            const response = await db.collection(COLLECTION_NAME).doc(WEB_MOVIEGOERS_DOC).get('users');
            const moviegoers = response.data();
            return moviegoers.users;
        } catch(err) {
            console.error(err);
            return [];
        }
    }
    /**
     * Get all unwatched movies. If user is passed, only movies that user has _NOT_ voted for
     * will be returned
     * 
     * @param {string} userId 
     * @returns 
     */
    #getUnwatchedMovies = async (userId = null) => {
        const { db } = this;

        try {
            const moviesResponse = await db.collection(MOVIES_COLLECTION).orderBy('posted').get();
            
            let movies = {};
            moviesResponse.forEach(resMovie => {
                let movie = resMovie.data();
                if ((!userId || (!movie.voted || !Object.keys(movie.voted).includes(userId))) && !movie.watched) {
                    
                    movies[resMovie.id] = movie;
                }
            });
            return movies;
        } catch(err) {
            console.error(err);
            return [];
        }
    }
    #getVotedMovies = async (userId) => {
        const { db } = this;

        try {
            const moviesResponse = await db.collection(MOVIES_COLLECTION).orderBy('posted').get();

            let movies = {};
            moviesResponse.forEach(movieRes => {
                let movie = movieRes.data();
                if (movie.voted && Object.keys(movie.voted).includes(userId) && !movie.watched) {
                    movies[movieRes.id] = movie;
                }
            });
            return movies;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    isUserMoviegoer = async (userId) => {
        const userList = await this.#getMoviegoerIds();
        return userList.includes(userId);
    }
    getMoviegoerCount = async () => {
        const userList = await this.#getMoviegoerIds();
        return userList.length;
    }
    getVotedMovies = async (userId) => {
        const movies = this.#getVotedMovies(userId);
        return movies;
    }
    getUnvotedMovies = async (userId) => {
        const movies = await this.#getUnwatchedMovies(userId);
        return movies;
    }
    addVote = async (userId, movieId) => {
        const { db } = this;
        const collection = db.collection(MOVIES_COLLECTION);

        const getMovieResponse = await collection.doc(movieId).get();
        const movie = getMovieResponse.data();
        movie.voted[userId] = true;
        return await collection.doc(movieId).update(movie);
    }
}

module.exports = (store) => {
    const instance = new ServerData(store);
    Object.freeze(instance);
    return instance;
}