import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Clip, SoundboardState } from "../../types";

const initialState: SoundboardState = {
    clips: []
};

export const fetchSoundboardClips = createAsyncThunk(
    'soundboard/fetchSoundboardClips',
    async () => {
        const response = await fetch('/api/soundboard');
        return response.json();
    }
)

export const addClip = createAsyncThunk(
    'soundboard/addClip',
    async (clip: Clip) => {
        const response = await fetch('/api/soundboard/add', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clip)
        });
        return response.json();
    }
)

const soundboard = createSlice({
    name: 'soundboard',
    initialState,
    reducers: {},
    extraReducers(builder) {
            builder
                .addCase(fetchSoundboardClips.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    state.clips = action.payload;
                })
                .addCase(addClip.fulfilled, (state, action: PayloadAction<Clip>) => {
                    state.clips.push(action.payload);
                })
        }
});

export default soundboard.reducer;