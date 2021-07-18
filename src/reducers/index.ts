import { combineReducers } from 'redux';

import userReducer from './user';
import botsReducer from './bots';
import moviesReducer from './movies';

const rootReducer = combineReducers({
    movies: moviesReducer,
    bots: botsReducer,
    user: userReducer
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;