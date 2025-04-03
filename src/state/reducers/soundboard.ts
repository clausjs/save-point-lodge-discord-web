import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Clip, SoundboardState } from "../../types";
import toastr from "../../utils/toastr";

const initialState: SoundboardState = {
    isMyInstants: false,
    lastResults: false,
    clips: [],
    allTags: [],
    clipFetchState: 'idle',
    clipSearchState: 'idle',
    clipAddState: 'idle',
    clipEditState: 'idle',
    clipDeleteState: 'idle'
};

export const fetchSoundboardClips = createAsyncThunk(
    'soundboard/fetchSoundboardClips',
    async () => {
        const response = await fetch('/api/soundboard');
        return response.json();
    }
)

export const fetchMyInstantsTrending = createAsyncThunk(
    'soundboard/fetchMyInstantsTrending',
    async (page: number) => {
        const response = await fetch(`/api/soundboard/myinstants?page=${page}`);
        return response.json();
    }
)

export const fetchMyInstantsRecent = createAsyncThunk(
    'soundboard/fetchMyInstantsRecent',
    async (page: number) => {
        const response = await fetch(`/api/soundboard/myinstants/recent?page=${page}`);
        return response.json();
    }
)

export const fetchMyInstantsByCategory = createAsyncThunk(
    'soundboard/fetchMyInstantsByCategory',
    async (opts: { category: string, page?: number }) => {
        const { category, page = 1 } = opts;
        const response = await fetch(`/api/soundboard/myinstants/${encodeURIComponent(category.toLowerCase())}?page=${page}`);
        return response.json();
    }
)

export const searchMyInstants = createAsyncThunk(
    'soundboard/searchMyInstants',
    async (opts: { search: string, page?: number }) => {
        const {  search, page = 1 } = opts;
        const response = await fetch(`/api/soundboard/myinstants/search?query=${encodeURIComponent(search)}&page=${page}`);
        return response.json();
    }
)

export const favoriteClip = createAsyncThunk(
    'soundboard/favoriteClip',
    async (clipId: string, { getState, dispatch }) => {
        const state = (getState() as any);
        const response = await fetch(`/api/soundboard/favorite/${encodeURIComponent(clipId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
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
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clip)
        });
        return response.json();
    }
)

export const deleteClip = createAsyncThunk(
    'soundboard/deleteClip',
    async (clip: Clip) => {
        const response = await fetch(`/api/soundboard/${clip.id}`, {
            method: 'DELETE'
        });
        return response.text();
    }
)

const disableSearch = (state: SoundboardState) => {
    state.clipSearchState = 'idle';
}

const soundboard = createSlice({
    name: 'soundboard',
    initialState,
    reducers: {
        resetClips: (state) => {
            state.clips = [];
        },

    },
    extraReducers(builder) {
            builder
                .addCase(fetchSoundboardClips.pending, (state) => {
                    state.clipFetchState = 'pending';
                    state.lastResults = false;
                })
                .addCase(fetchSoundboardClips.rejected, (state) => {
                    state.clipFetchState = 'rejected';
                })
                .addCase(fetchSoundboardClips.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    state.clips = action.payload;
                    state.clipFetchState = 'fulfilled';
                    state.clipFetchState = 'idle';
                    state.lastResults = true;
                    state.isMyInstants = false;
                    const allTags: string[] = [];
                    for (const clip of action.payload) {
                        const tags = clip.tags || [];
                        tags.forEach(tag =>  { if (!allTags.includes(tag.toLowerCase())) allTags.push(tag.toLowerCase()); });
                    }
                    state.allTags = allTags;
                })
                .addCase(fetchMyInstantsTrending.pending, (state) => {
                    state.clipFetchState = 'pending';
                    state.lastResults = false;
                })
                .addCase(fetchMyInstantsTrending.rejected, (state) => {
                    state.clipFetchState = 'rejected';
                })
                .addCase(fetchMyInstantsTrending.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    if (state.isMyInstants) {
                        const newClips = [ ...state.clips, ...action.payload ];
                        if (action.payload.length === 0 || newClips.length >= 200) {
                            state.lastResults = Boolean(true);
                        }
                        state.clips = newClips;
                    } else state.clips = action.payload;
                    state.clipFetchState = 'fulfilled';
                    disableSearch(state);
                    state.isMyInstants = true;
                })
                .addCase(fetchMyInstantsRecent.pending, (state) => {
                    state.clipFetchState = 'pending';
                    state.lastResults = false;
                })
                .addCase(fetchMyInstantsRecent.rejected, (state) => {
                    state.clipFetchState = 'rejected';
                })
                .addCase(fetchMyInstantsRecent.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    if (state.isMyInstants) {
                        if (action.payload.length === 0) state.lastResults = true;
                        else state.clips = [...state.clips, ...action.payload];
                        if (state.clips.length >= 200) state.lastResults = true;
                    } else state.clips = action.payload;
                    state.clipFetchState = 'fulfilled';
                    disableSearch(state);
                    state.isMyInstants = true;
                })
                .addCase(fetchMyInstantsByCategory.pending, (state) => {
                    state.clipFetchState = 'pending';
                    state.lastResults = false;
                })
                .addCase(fetchMyInstantsByCategory.rejected, (state) => {
                    state.clipFetchState = 'rejected';
                })
                .addCase(fetchMyInstantsByCategory.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    if (state.isMyInstants) {
                        if (action.payload.length === 0) state.lastResults = true;
                        else state.clips = [...state.clips, ...action.payload];
                        if (state.clips.length >= 200) state.lastResults = true;
                    } else state.clips = action.payload;
                    state.clipFetchState = 'fulfilled';
                    disableSearch(state);
                    state.isMyInstants = true;
                })
                .addCase(searchMyInstants.pending, (state) => {
                    state.clipSearchState = 'pending';
                    state.lastResults = false;
                })
                .addCase(searchMyInstants.rejected, (state) => {
                    state.clipSearchState = 'rejected';
                })
                .addCase(searchMyInstants.fulfilled, (state, action: PayloadAction<Clip[]>) => {
                    state.clipSearchState = 'fulfilled';
                    if (state.isMyInstants && state.clipSearchState === 'fulfilled') {
                        if (action.payload.length === 0) state.lastResults = true;
                        else state.clips = [...state.clips, ...action.payload];
                        if (state.clips.length >= 200) state.lastResults = true;
                    } else state.clips = action.payload;
                })
                .addCase(favoriteClip.fulfilled, (state, action: PayloadAction<Clip>) => {
                    const clipIndex = state.clips.findIndex(clip => clip.id === action.payload.id);
                    if (clipIndex !== -1) state.clips.splice(clipIndex, 1, action.payload);
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
                    toastr.success('Clip added!');
                })
                .addCase(editClip.pending, (state) => {
                    state.clipEditState = 'pending';
                })
                .addCase(editClip.rejected, (state) => {
                    state.clipEditState = 'rejected';
                })
                .addCase(editClip.fulfilled, (state, action: PayloadAction<Clip>) => {
                    const index = state.clips.findIndex(clip => clip.id === action.payload.id);
                    if (index !== -1) {
                        state.clips[index] = action.payload;
                    }
                    state.clipEditState = 'fulfilled';
                })
                .addCase(deleteClip.pending, (state) => {
                    state.clipDeleteState = 'pending';
                })
                .addCase(deleteClip.rejected, (state) => {
                    state.clipDeleteState = 'rejected';
                })
                .addCase(deleteClip.fulfilled, (state, action: PayloadAction<string>) => {
                    state.clipDeleteState = 'fulfilled';
                    state.clips = state.clips.filter(clip => clip.id !== action.payload);
                })
        }
});

export const { resetClips } = soundboard.actions;
export default soundboard.reducer;