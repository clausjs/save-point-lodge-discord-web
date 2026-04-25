import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StreamDeckState } from "../../types";

const initialState: StreamDeckState = {
    token: null,
    tokenFetchState: 'idle'
}

export const fetchToken = createAsyncThunk(
    'streamdeck/fetchToken',
    async () => {
        const response = await fetch('/api/user/streamdeck/token');
        const data = await response.json();
        return data.token || null;
    }
);

const streamdeck = createSlice({
    name: 'streamdeck',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchToken.pending, (state) => {
                state.tokenFetchState = 'pending';
            })
            .addCase(fetchToken.fulfilled, (state, action: PayloadAction<string | null>) => {
                state.token = action.payload;
                state.tokenFetchState = 'fulfilled';
            })
    }
});

export default streamdeck.reducer;