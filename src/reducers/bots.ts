import { FETCH_COMMANDS } from "../redux-types/botsTypes";

import {
    BotState,
    Action
} from '../types';

const botsState: BotState = {
    commands: []
};

const botsReducer = (state = botsState, action: Action) => {
    switch (action.type) {
        case FETCH_COMMANDS:
            return { ...state, commands: action.payload };
        default:
            return state;
    }
}

export default botsReducer;