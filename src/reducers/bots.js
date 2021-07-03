import { FETCH_COMMANDS } from "../redux-types/botsTypes";

const botsState = {
    commands: []
};

const botsReducer = (state = botsState, action) => {
    switch (action.type) {
        case FETCH_COMMANDS:
            return { ...state, commands: action.payload };
        default:
            return state;
    }
}

export default botsReducer;