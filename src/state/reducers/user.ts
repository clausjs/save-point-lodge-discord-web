import fetch from 'node-fetch';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SoundboardOptions, User, UserOptions, UserState } from '../../types';
import { RootState } from '../store';

const initialState: UserState = {
    user: null,
    opts: {},
    soundboardOpts: {}
}

// const ORIGIN_PROTOCOL = window.location.protocol;
// const ORIGIN_HOST = window.location.host;
// const ORIGIN = `${ORIGIN_PROTOCOL}//${process.env.NODE_ENV === 'development' ? 'localhost:3000' : ORIGIN_HOST}`;
// const LOGIN_WINDOW_CLOSED = 'LOGIN_WINDOW_CLOSED';

// export const login = createAsyncThunk(
//     'user/login',
//     async (route: string | null) => {
//         if (process.env.NODE_ENV === 'development') {
//             try {
//                 const response = await fetch('/login', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ username: 'sadsad', password: 'adasdas' })
//                 });
//                 const responseJSON = await response.json();
//                 const loginRes = JSON.parse(JSON.stringify(responseJSON));
//                 let user = loginRes;
//                 const isSPLMemberResponse = await fetch('/api/user/lodgeguest');
//                 const isSoundboardUserResponse = await fetch('/api/user/soundboarder');
//                 user.isPlanetExpressMember = await isSPLMemberResponse.json();
//                 user.isSoundboardUser = await isSoundboardUserResponse.json();
//                 return { user };
//             } catch (err) {
//                 console.error(err);
//                 throw new Error("Login failed");
//             }
//         } else {
//             return new Promise(async (resolve, reject) => {
//                 const signInPopup = window.open(route ? route : "/login-discord", "_blank");
//                 signInPopup?.focus();

//                 const interval: NodeJS.Timer = setInterval(() => {
//                     if (signInPopup?.closed) {
//                         clearInterval(interval);
//                         reject(new Error(LOGIN_WINDOW_CLOSED));
//                     }
//                     const message = JSON.stringify({ type: 'discord-auth-heartbeat' });
//                     signInPopup?.postMessage(message, ORIGIN);
//                 }, 500);

//                 window.addEventListener("message", async (event) => {
//                     if (event.origin !== ORIGIN) reject(new Error('Something went wrong communicating with the login window'));
    
//                     try {
//                         const data = JSON.parse(event.data);
//                         if (data.type === 'loginResponse') {
//                             clearInterval(interval);
//                             signInPopup?.close();
//                             const response = await fetch('/api/user');
//                             const responseJSON = await response.json();
//                             const loginRes = JSON.parse(JSON.stringify(responseJSON));
//                             let user = loginRes;
//                             const isSPLMemberResponse = await fetch('/api/user/lodgeguest');
//                             const isSoundboardUserResponse = await fetch('/api/user/soundboarder');
//                             user.isPlanetExpressMember = await isSPLMemberResponse.json();
//                             user.isSoundboardUser = await isSoundboardUserResponse.json();
//                             //@ts-ignore
//                             resolve({ user });
//                         }
//                     } catch (err) {
//                         console.error(err);
//                         reject(new Error("Login failed"));
//                     }
//                 });
//             });
//         }
//     }
// )

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (_: void, { getState, dispatch }) => {
        const { user: state } = getState() as RootState;
        if (state.user) return { user: state.user };

        const userRes = await fetch('/api/user');
        const plexRes = await fetch('/api/user/lodgeguest');
        const soundboardRes = await fetch('/api/user/soundboarder');
        const parsedUser = await userRes.json();
        if (!parsedUser) { return { user: null } }
        const isPlanetExpressMember = await plexRes.json();
        const isSoundboardUser = await soundboardRes.json();
        const user = {
            ...JSON.parse(JSON.stringify(parsedUser)),
            isPlanetExpressMember,
            isSoundboardUser
        }
        return { user };
    }
)

export const fetchSoundboarderStatus = createAsyncThunk(
    'user/fetchSoundboarderStatus',
    async (_: void, { getState, dispatch }) => {
        const { user: state } = getState() as RootState;
        if (state.user) {
            if (state.user.isSoundboardUser !== undefined) {
                return state.user.isSoundboardUser;
            }

            const response = await fetch('/api/user/soundboarder');
            return response.json();
        } else return false;
    }
)

export const fetchPlanetExpressStatus = createAsyncThunk(
    'user/fetchPlanetExpressStatus',
    async (_: void, { getState, dispatch }) => {
        const { user: state } = getState() as RootState;
        if (state.user) {
            if (state.user.isPlanetExpressMember !== undefined) {
                return state.user.isPlanetExpressMember;
            }
            
            const response = await fetch('/api/user/lodgeguest');
            return response.json();
        } else return false;
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
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.userFetchState = 'pending';
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<{ user?: User }>) => {
                if (action.payload.user) state.user = action.payload.user;
                state.userFetchState = 'fulfilled';
            })
            .addCase(fetchUser.rejected, (state, action: any) => {
                state.user = null;
                state.userFetchState = 'rejected';
            })
            .addCase(fetchSoundboarderStatus.pending, (state) => {
                state.soundboardStatusFetchState = 'pending';
            })
            .addCase(fetchSoundboarderStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                if (state.user) state.user.isSoundboardUser = action.payload;
                state.soundboardStatusFetchState = 'fulfilled';
            })
            .addCase(fetchSoundboarderStatus.rejected, (state) => {
                state.soundboardStatusFetchState = 'rejected';
            })
            .addCase(fetchPlanetExpressStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                if (state.user) state.user.isPlanetExpressMember = action.payload;
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