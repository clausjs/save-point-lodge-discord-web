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

export const editClip = createAsyncThunk(
    'soundboard/editClip',
    async (clip: Clip) => {
        const response = await fetch(`/api/soundboard/${clip.id}`, {
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
                .addCase(fetchSoundboardClips.pending, (state) => {
                    state.clipFetchState = 'pending';
                })
                .addCase(fetchSoundboardClips.rejected, (state) => {
                    state.clipFetchState = 'rejected';
                })
                .addCase(fetchSoundboardClips.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    state.clips = action.payload;
                    state.clipFetchState = 'fulfilled';
                })
                .addCase(addClip.pending, (state) => {
                    state.clipAddState = 'pending';
                })
                .addCase(addClip.rejected, (state) => {
                    state.clipAddState = 'rejected';
                })
                .addCase(addClip.fulfilled, (state, action: PayloadAction<Clip>) => {
                    state.clips.push(action.payload);
                    state.clipAddState = 'fulfilled';
                })
                .addCase(editClip.pending, (state) => {
                    console.log("pending edit");
                    state.clipEditState = 'pending';
                })
                .addCase(editClip.rejected, (state) => {
                    state.clipEditState = 'rejected';
                })
                .addCase(editClip.fulfilled, (state, action: PayloadAction<Clip>) => {
                    console.log("edit success");
                    const index = state.clips.findIndex(clip => clip.id === action.payload.id);
                    if (index !== -1) {
                        state.clips[index] = action.payload;
                    }
                    state.clipEditState = 'fulfilled';
                })
        }
});

export default soundboard.reducer;