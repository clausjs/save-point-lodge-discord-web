import fetch from 'node-fetch';

import { FETCH_VOTABLE_MOVIES, FETCH_MOVIE_STATS } from '../redux-types/movieTypes';

export function fetchVotableMovies(userId) {
    return dispatch => {
        fetch('/api/movies/vote').then(res => res.json()).then(data => 
            dispatch({type: FETCH_VOTABLE_MOVIES, payload: { data }}));
    }
}