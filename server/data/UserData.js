const USER_OPTS_COLLECTION = "user_options";

class UserData {
    constructor(params) {
        this.db = params.store;
        this.userId = params.userId;
        this.serverdata = params.serverdata;
    }
    isUserMoviegoer = async () => {
        const isUserMoviegoer = await this.serverdata.isUserMoviegoer(this.userId);
        return isUserMoviegoer;
    }
    getOptionsDescriptions = async () => {
        const { db } = this;

        try {
            const descriptionsResponse = await db.collection(USER_OPTS_COLLECTION).doc('descriptions').get();
            const descriptions = descriptionsResponse.data();
            return descriptions;
        } catch (err) {
            return null;
        }
    }
    getUserOptions = async () => {
        const { db } = this;

        try {
            const optsResponse = await db.collection(USER_OPTS_COLLECTION).doc(this.userId).get();
            const userOpts = optsResponse.data();
            return userOpts;
        } catch (err) {
            return {};
        }
    }
    setUserOption = async (option) => {
        const { db } = this;

        try {
            await db.collection(USER_OPTS_COLLECTION).doc(this.userId).update(option);
        } catch (err) {

        } finally {
            return options;
        }
    }
    getUnvotedMovies = async () => {
        const { serverdata } = this;

        try {
            const movies = await serverdata.getUnvotedMovies(this.userId);
            return movies;
        } catch (err) {
            return [];
        }
    }
    getVotedMovieStatistics = async () => {
        const { serverdata } = this;

        try { 
            const movies = await serverdata.getVotedMovies(this.userId);
            const totalMoviegoers = await serverdata.getMoviegoerCount();
            return {
                movies,
                totalMoviegoers
            }
        } catch (err) {
            return [];
        }
    }
    addVote = async (movieId) => {
        const { serverdata, userId } = this;

        try {
            await serverdata.addVote(userId, movieId);
            const movies = await serverdata.getUnvotedMovies(userId);
            return movies;
        } catch (err) {
            return [];
        }
    }
}

module.exports = (params) => {
    const instance = new UserData(params);
    Object.freeze(instance);
    return instance;
}