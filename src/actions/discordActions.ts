import {
    FETCH_DISCORD_MEMBERS
} from '../redux-types/discordTypes';

function fetchWidget() {
    return fetch('/api/discord/members').then(res => res.json());
}

export function fetchDiscordWidget() {
    return (dispatch: any) => {
        return fetchWidget().then(data => {
            dispatch({ type: FETCH_DISCORD_MEMBERS, payload: data })
        });
    }
}