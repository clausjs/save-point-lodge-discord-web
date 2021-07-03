import { combineReducers } from 'redux';

import botsReducer from './bots';
import moviesReducer from './movies';

const rootReducer = combineReducers({
    movies: moviesReducer,
    bots: botsReducer
});

export default rootReducer;