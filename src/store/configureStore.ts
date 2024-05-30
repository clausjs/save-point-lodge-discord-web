import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '../reducers/theme';
import moviesReducer from '../reducers/movies';
import botsReducer from '../reducers/bots';
import userReducer from '../reducers/user';
import discordReducer from '../reducers/discord';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    movies: moviesReducer,
    bots: botsReducer,
    user: userReducer,
    discord: discordReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch