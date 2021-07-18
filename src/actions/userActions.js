import fetch from 'node-fetch';

import { FETCH_AUTHORIZATION } from '../redux-types/userTypes';

function fetchAuthorization() {
    return fetch('/api/user').then(res => res.json());
}

export function fetchUserAuthorization() {
    return dispatch => {
        return fetchAuthorization().then(data => {
            dispatch({ type: FETCH_AUTHORIZATION, payload: data });
        })
    }
}