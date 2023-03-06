import { createReducer } from "@reduxjs/toolkit";

import { toggleLightMode } from "../actions/themeActions";

export interface ThemeState {
    lightMode: boolean;
}

const initialState: ThemeState = {
    lightMode: false
};

const themeReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(toggleLightMode, (state) => {
            console.log("toggleLightMode");
            state.lightMode = !state.lightMode;
            document.body.classList.toggle("light");
        });
});

export default themeReducer;
