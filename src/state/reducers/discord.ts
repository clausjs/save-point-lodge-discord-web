import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DiscordState, DiscordUser } from "../../types";

const initialState: DiscordState = {
    members: []
}

export const fetchDiscordMembers = createAsyncThunk(
    'discord/fetchDiscordMembers',
    async () => {
        const response = await fetch('/api/discord/members');
        return response.json();
    }
)

const discord = createSlice({
    name: 'discord',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchDiscordMembers.fulfilled, (state, action: PayloadAction<DiscordUser[]>) => {
                state.members = action.payload;
            })
    }
});

export default discord.reducer;