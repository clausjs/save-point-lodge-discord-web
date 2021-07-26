import fetch from 'node-fetch';

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

function submitVoteFetch(movie: string) {
    const requestParams = {
        method: 'POST',
        body: JSON.stringify({ movieId: movie }),
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch('/api/movies/vote', requestParams).then(res => res.json());
}

export function fetchVotableMovies() {
    return (dispatch: any) => {
        return fetchMovies().then(data => {
            dispatch({ type: FETCH_VOTABLE_MOVIES, payload: data })
        });
    }
}

export function fetchMovieStats() {
    return (dispatch: any) => {
        return fetchStats().then(data => {
            dispatch({ type: FETCH_MOVIE_STATS, payload: data });
        });
    }
}

export function submitVote(movie: string) {
    return (dispatch: any) => {
        return submitVoteFetch(movie).then(data => {
            dispatch({ type: SUBMIT_VOTE, payload: data })
        });
    }
}