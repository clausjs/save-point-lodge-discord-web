import fetch from 'node-fetch';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SoundboardOptions, User, UserOptions, UserState } from '../../types';

const initialState: UserState = {
    user: null,
    opts: {},
    soundboardOpts: {}
}


export const login = createAsyncThunk(
    'user/login',
    async () => {
        if (process.env.NODE_ENV === 'development') {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'sadsad', password: 'adasdas' })
            });
            const responseJSON = await response.json();
            const loginRes = JSON.parse(JSON.stringify(responseJSON));
            let user = loginRes;
            const isSPLMemberResponse = await fetch('/api/user/lodgeguest');
            const isSoundboardUserResponse = await fetch('/api/user/soundboarder');
            user.isPlanetExpressMember = await isSPLMemberResponse.json();
            user.isSoundboardUser = await isSoundboardUserResponse.json();
            return { user };
        } else {
            window.location.href = "/login-discord";
        }
    }
)

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
        const response = await fetch('/api/user/lodgeguest');
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

export const fetchSoundboardOpts = createAsyncThunk(
    'user/fetchSoundboardOpts',
    async () => {
        const response = await fetch('/api/user/soundboard/opts');
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

export const setSoundboardOption = createAsyncThunk(
    'user/setSoundboardOption',
    async (opts: SoundboardOptions) => {
        const requestParams = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(opts)
        };

        const response = await fetch('/api/user/soundboard/opts', requestParams);
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
            .addCase(login.fulfilled, (state, action: PayloadAction<{ user?: User, redirect?: string }>) => {
                if (action.payload.redirect) window.location.href = action.payload.redirect;
                if (action.payload.user) {
                    state.user = action.payload.user;
                }
                
                // window.location.href = "/";
            })
            .addCase(fetchSoundboarderStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                if (state.user) state.user.isSoundboardUser = action.payload;
            })
            .addCase(fetchPlanetExpressStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                if (state.user) state.user.isPlanetExpressMember = action.payload;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                if (state.user === null) state.user = action.payload;
                else state.user = { ...state.user, ...action.payload };
            })
            .addCase(fetchUserOpts.fulfilled, (state, action: PayloadAction<UserOptions>) => {
                state.opts = action.payload;
            })
            .addCase(fetchSoundboardOpts.fulfilled, (state, action: PayloadAction<SoundboardOptions>) => {
                state.soundboardOpts = action.payload;
            })
            .addCase(setSoundboardOption.fulfilled, (state, action: PayloadAction<SoundboardOptions>) => {
                state.soundboardOpts = action.payload;
            })
    },
});

export default userSlice.reducer;