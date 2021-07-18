import fetch from 'node-fetch';
import { bindActionCreators } from 'redux';

import { FETCH_VOTABLE_MOVIES, 
    FETCH_MOVIE_STATS,
    SUBMIT_VOTE
} from '../redux-types/movieTypes';

function fetchMovies() {
    return fetch('/api/movies/vote').then(res => res.json());
}

function fetchStats() {
    return fetch('/api/movies/movie-stats').then(res => res.json());
}

function submitVoteFetch(movie) {
    const requestParams = {
        method: 'POST',
        body: JSON.stringify({ movieId: movie }),
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch('/api/movies/vote', requestParams).then(res => res.json());
}

export function fetchVotableMovies() {
    return dispatch => {
        return fetchMovies().then(data => {
            dispatch({ type: FETCH_VOTABLE_MOVIES, payload: data })
        });
    }
}

export function fetchMovieStats() {
    return dispatch => {
        return fetchStats().then(data => {
            dispatch({ type: FETCH_MOVIE_STATS, payload: data });
        });
    }
}

export function submitVote(movie) {
    return dispatch => {
        return submitVoteFetch(movie).then(data => {
            dispatch({ type: SUBMIT_VOTE, payload: data })
        });
    }
}