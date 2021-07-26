import fetch from 'node-fetch';

import { 
    FETCH_AUTHORIZATION,
    INITIATE_AUTH_FETCH,
    FETCH_MEMBER_OPTS,
    FETCH_OPTS_DESCRIPTIONS
} from '../redux-types/userTypes';

import {
    UserOption
} from '../types';

function fetchAuthorization() {
    return fetch('/api/user').then(res => res.json());
}

function fetchMemberOptions() {
    return fetch('/api/user/opts').then(res => res.json());
}

function fetchOptionDescriptions() {
    return fetch('/api/user/opts/descriptions').then(res => res.json());
}

function setOption(option: UserOption) {
    const requestParams = {
        method: 'POST',
        body: JSON.stringify(option),
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch('/api/user/opts', requestParams).then(res => res.json());
}

export function fetchUserAuthorization() {
    return (dispatch: any) => {
        dispatch({ type: INITIATE_AUTH_FETCH });
        return fetchAuthorization().then(data => {
            dispatch({ type: FETCH_AUTHORIZATION, payload: data });
        });
    }
}

export function fetchUserOpts() {
    return (dispatch: any) => {
        fetchMemberOptions().then(opts => {
            dispatch({ type: FETCH_MEMBER_OPTS, payload: opts });
            fetchOptionDescriptions().then(desc => {
                return dispatch({ type: FETCH_OPTS_DESCRIPTIONS, payload: desc });
            });
        });
    }
}

export function setUserOption(option: UserOption) {
    return (dispatch: any) => {
        setOption(option).then(data => {
            fetchMemberOptions().then(opts => {
                dispatch({ type: FETCH_MEMBER_OPTS, payload: opts });
            });
        });
    }
}