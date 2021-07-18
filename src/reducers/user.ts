import { FETCH_AUTHORIZATION } from "../redux-types/userTypes";

import {
    UserState,
    Action
} from '../../types';

const userState: UserState = {
    user: null
}

const userReducer = (state: UserState = userState, action: Action): UserState => {
    switch (action.type) {
        case FETCH_AUTHORIZATION:
            return {...state, user: action.payload };
        default:
            return state;
    }
}

export default userReducer;