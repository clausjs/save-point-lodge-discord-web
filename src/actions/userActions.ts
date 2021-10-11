import fetch from 'node-fetch';

import { 
    FETCH_AUTHORIZATION,
    INITIATE_AUTH_FETCH,
    FETCH_MEMBER_OPTS,
    FETCH_MOVIEGOER_STATUS,
    FETCH_GUEST_STATUS
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

function setOption(option: UserOption) {
    const requestParams = {
        method: 'POST',
        body: JSON.stringify(option),
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch('/api/user/opts', requestParams).then(res => res.json());
}

function getMoviegoerStatus() {
    return fetch('/api/user/moviegoer').then(res => res.text());
}

function getGuestStatus() {
    return fetch('/api/user/lodgeguest').then(res => res.text());
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

export function isMoviegoer() {
    return (dispatch: any) => {
        getMoviegoerStatus().then(res => {
            dispatch({ type: FETCH_MOVIEGOER_STATUS, payload: res });
        });
    }
}

export function isSPLMember() {
    return (dispatch: any) => {
        getGuestStatus().then(res => {
            dispatch({ type: FETCH_GUEST_STATUS, payload: res });   
        });
    }
}