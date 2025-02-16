import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
    lightMode: boolean;
}

const theme = createSlice({
    name: 'theme',
    initialState: { lightMode: false } as ThemeState,
    reducers: {
        toggleLightMode: (state) => {
            state.lightMode = !state.lightMode;
            document.body.classList.toggle("light");
        }
    }
});

export const { toggleLightMode } = theme.actions;
export default theme.reducer;