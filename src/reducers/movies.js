import { FETCH_MOVIE_STATS, FETCH_VOTABLE_MOVIES, SUBMIT_VOTE } from '../redux-types/movieTypes';

const moviesState = {
    votable: {},
    stats: {
        movies: {},
        totalMoviegoers: null
    }
};

const moviesReducer = (state = moviesState, action) => {
    switch (action.type) {
        case FETCH_VOTABLE_MOVIES:
            return { ...state, votable: action.payload };
        case FETCH_MOVIE_STATS:
            return { ...state, stats: action.payload };
        case SUBMIT_VOTE:
            return { ...state, votable: action.payload };
        default:
            return state;
    }
}

export default moviesReducer;