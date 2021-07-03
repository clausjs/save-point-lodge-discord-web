import { FETCH_VOTABLE_MOVIES } from '../redux-types/movieTypes';

const moviesState = {
    votable: {},
    stats: {}
};

const moviesReducer = (state = moviesState, action) => {
    switch (action.type) {
        case FETCH_VOTABLE_MOVIES:
            return Object.assign(state, { votable: action.payload });
        default:
            return state;
    }
}

export default moviesReducer;