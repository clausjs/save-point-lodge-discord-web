import { 
    FETCH_AUTHORIZATION,
    INITIATE_AUTH_FETCH,
    FETCH_MEMBER_OPTS,
    FETCH_MOVIEGOER_STATUS,
    FETCH_GUEST_STATUS
} from "../redux-types/userTypes";

import {
    UserState,
    Action
} from '../types';

const userState: UserState = {
    status: 'idle',
    error: null,
    user: null,
    opts: {},
    isMoviegoer: false,
    isLodgeGuest: false
}

const userReducer = (state: UserState = userState, action: Action): UserState => {
    switch (action.type) {
        case INITIATE_AUTH_FETCH:
            return { ...state, status: 'loading' };
        case FETCH_AUTHORIZATION:
            return {...state, user: action.payload, status: 'succeeded' };
        case FETCH_MEMBER_OPTS:
            return {...state, opts: action.payload };
        case FETCH_MOVIEGOER_STATUS:
            return {...state, isMoviegoer: action.payload };
        case FETCH_GUEST_STATUS:
            return {...state, isLodgeGuest: action.payload };
        default:
            return state;
    }
}

export default userReducer;