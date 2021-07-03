import fetch from 'node-fetch';

import { FETCH_COMMANDS } from '../redux-types/botsTypes';

function fetchCommandsFromDb() {
    return fetch('/api/commands/');
}

export function fetchCommands() {
    return dispatch => {
        return fetchCommandsFromDb().then(res => res.json()).then(data => {
            dispatch({ type: FETCH_COMMANDS, payload: data })
        });
    }
}