import { FETCH_DISCORD_MEMBERS } from "../redux-types/discordTypes";

import {
    DiscordState,
    Action
} from '../types';

const botsState: DiscordState = {
    members: []
};

const DiscordReducer = (state = botsState, action: Action) => {
    switch (action.type) {
        case FETCH_DISCORD_MEMBERS:
            return { ...state, members: action.payload };
        default:
            return state;
    }
}

export default DiscordReducer;