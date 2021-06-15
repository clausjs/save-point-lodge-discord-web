import React, { useState, useLayoutEffect, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import MovieOutlinedIcon from '@material-ui/icons/MovieOutlined';
import MovieIcon from '@material-ui/icons/Movie';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';


import fetch from 'node-fetch';

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650
    }
}));

import '../../../sass/movies.scss';

const Vote = (auth = null) => {
    const classes = useStyles();

    const [ movies, setMovies ] = useState(null);
    const [ searchVal, setSearchVal ] = useState("");
    const [ viewing, setMoviesViewing ] = useState({});
    const [ perPage, setPerPage ] = useState(5);
    const [ page, setPage ] = useState(0);

    useLayoutEffect(() => {
        if (auth !== null && movies === null) {
            fetch('/api/movies/vote').then(res => res.json()).then(data => {
                setMovies(data);
            }).catch(err => {
                console.error(err);
            });
        }
    }, [auth]);

    const setViewingMovies = () => {
        const _viewing = {};
    
        for (let i = perPage*page; i < Object.keys(movies).length; i++) {
            const id = Object.keys(movies)[i];
            const movie = movies[id];

            if (Object.keys(_viewing).length !== perPage) {
                _viewing[id] = movie;
            } else {
                break;
            }
        }

        setMoviesViewing(_viewing);
    }

    useEffect(() => {
        if (movies !== null) {
            setViewingMovies();
        }
    }, [movies, page, perPage]);

    const handleChangePage = (event, newPage) => {
        if (newPage) {
            setPage(newPage);
        }
    }

    const handleChangeRowsPerPage = (event) => {
        const { value } = event.target;

        if (value) {
            setPerPage(value);
        }
    }

    const addVote = (event) => {
        const { name: movieId } = event.target;

        if (movieId) {
            fetch('api/movies/vote', {
                method: "POST",
                body: JSON.stringify({ movieId: movieId }),
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json()).then(data => {
                const _viewing = viewing;
                delete _viewing[movieId];
                setMoviesViewing(_viewing);
                setMovies(data);
            }).catch(err => {
                console.error(err);
            });
        }
    }

    const searchResults = (event, textVal) => {
        const { value } = event.target;
        setSearchVal(value);

        if (!value || value.length <= 2) {
            setViewingMovies();
        } else {
            const _newViewing = {};
            Object.keys(movies).map(movieId => {
                const movie = movies[movieId];
                if (movie.title.toLowerCase().substring(0, value.length) === value.toLowerCase()) {
                    _newViewing[movieId] = movie;
                }
            });
            setMoviesViewing(_newViewing);
        }
    }

    const clearResults = () => {
        setSearchVal("");
        setViewingMovies();
    }

    const movieCount = Object.keys(movies || {}).length;
    const isSearchError = searchVal.length >= 1 && searchVal.length <=2 ? true : false;

    if (movies) {
        return (
            <div className="vote-section">
                <div className="table-search">
                    <TextField
                        error={isSearchError}
                        id="movie-search"
                        label="Search for movie"
                        onChange={searchResults}
                        value={searchVal}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <ClearIcon disabled={searchVal.length < 2} onClick={clearResults} />
                                </InputAdornment>
                            )
                        }}
                    />
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="Movies you can vote for">
                        <TableHead>
                            <TableRow>
                                <TableCell size="small">Poster</TableCell>
                                <TableCell align="left" className="title-cell">Movie Name</TableCell>
                                <TableCell size="small">Total Votes</TableCell>
                                <TableCell>Add Your Vote?</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(viewing).map((id) => {
                                const movie = movies[id];
                                return (
                                    <TableRow key={id}>
                                        <TableCell className="poster-cell" size="small" component="th" scope="row">
                                            <img src={movie.poster} />
                                        </TableCell>
                                        <TableCell className="title-cell" align="left" title={movie.title}>{movie.title}</TableCell>
                                        <TableCell size="small">{Object.keys(movie.voted || {}).length}</TableCell>
                                        <TableCell padding='checkbox'>
                                            <Checkbox icon={<MovieOutlinedIcon />} checkedIcon={<MovieIcon />} name={id} title={movie.title} onChange={addVote} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[3, 5, 10, 20]}
                    component="div"
                    count={movieCount}
                    rowsPerPage={perPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </div>
        );
    } else {
        return (
            <div className="no-movies">
                <h5>Sorry, there are no movies for you to vote for</h5>
            </div>
        );
    }
}

export default Vote;