import { 
    FETCH_AUTHORIZATION,
    INITIATE_AUTH_FETCH,
    FETCH_MEMBER_OPTS, 
    FETCH_OPTS_DESCRIPTIONS
} from "../redux-types/userTypes";

import {
    UserState,
    Action
} from '../../types';

const userState: UserState = {
    status: 'idle',
    error: null,
    user: null,
    opts: {},
    descriptions: {}
}

const userReducer = (state: UserState = userState, action: Action): UserState => {
    switch (action.type) {
        case INITIATE_AUTH_FETCH:
            return { ...state, status: 'loading' };
        case FETCH_AUTHORIZATION:
            return {...state, user: action.payload, status: 'succeeded' };
        case FETCH_MEMBER_OPTS:
            return {...state, opts: action.payload };
        case FETCH_OPTS_DESCRIPTIONS:
            return {...state, descriptions: action.payload };
        default:
            return state;
    }
}

export default userReducer;