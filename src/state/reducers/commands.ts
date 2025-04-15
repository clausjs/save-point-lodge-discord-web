import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { CommandState } from '../../types';

const initialState: CommandState = {
    commands: []
}

export const fetchCommands = createAsyncThunk(
    'commands/fetchCommands',
    async () => {
        const response = await fetch('/api/commands');
        return response.json();
    }
)

const commandsSlice = createSlice({
    name: 'commands',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchCommands.fulfilled, (state, action) => {
                state.commands = action.payload;
            })
    }
});

export default commandsSlice.reducer;