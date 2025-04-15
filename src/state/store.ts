import { configureStore } from "@reduxjs/toolkit";

import theme from "./reducers/theme";
import discord from "./reducers/discord";
import user from "./reducers/user";
import commands from "./reducers/commands";
import soundboard from "./reducers/soundboard";

export const store = configureStore({
    reducer: {
        theme,
        discord,
        user,
        commands,
        soundboard
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch