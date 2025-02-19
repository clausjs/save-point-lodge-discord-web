import fetch from 'node-fetch';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User, UserOptions, UserState } from '../../types';

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

export const fetchSoundboarderStatus = createAsyncThunk(
    'user/fetchSoundboarderStatus',
    async () => {
        const response = await fetch('/api/user/soundboarder');
        return response.json();
    }
)

export const fetchPlanetExpressStatus = createAsyncThunk(
    'user/fetchPlanetExpressStatus',
    async () => {
        const response = await fetch('/api/user/planetexpress');
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
            .addCase(fetchSoundboarderStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.user.isSoundboardUser = action.payload;
            })
            .addCase(fetchPlanetExpressStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.user.isPlanetExpressMember = action.payload;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
            })
            .addCase(fetchUserOpts.fulfilled, (state, action: PayloadAction<UserOptions>) => {
                state.opts = action.payload;
            })
    },
});

export default userSlice.reducer;