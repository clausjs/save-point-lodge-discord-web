import fetch from 'node-fetch';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UserOptions, UserState } from '../../types';

const initialState: UserState = {
    user: null,
    opts: {}
}

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async () => {
        const response = await fetch('/api/user');
        return response.json();
    }
)

export const fetchUserOpts = createAsyncThunk(
    'user/fetchUserOpts',
    async () => {
        const response = await fetch('/api/user/opts');
        return response.json();
    }
)

export const setOption = createAsyncThunk(
    'user/setOption',
    async (option: UserOptions) => {
        const requestParams = {
            method: 'POST',
            body: JSON.stringify(option),
            headers: { 'Content-Type': 'application/json' }
        };

        const response = await fetch('/api/user/opts', requestParams);
        return response.json();
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState['user']>) => {
            state.user = action.payload;
        },
        setUserOpts: (state, action: PayloadAction<UserState['opts']>) => {
            state.opts = action.payload;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(fetchUserOpts.fulfilled, (state, action) => {
                state.opts = action.payload;
            })
    },
});

export default userSlice.reducer;