import React, { useState, useEffect } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    Checkbox,
    InputAdornment,
    TextField
} from '@material-ui/core';

import {
    MovieOutlined as MovieOutlinedIcon,
    Movie as MovieIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@material-ui/icons';

import '../../../sass/movies.scss';

const Vote = (props) => {

    const [ searchVal, setSearchVal ] = useState("");
    const [ viewing, setMoviesViewing ] = useState({});
    const [ perPage, setPerPage ] = useState(5);
    const [ page, setPage ] = useState(0);

    const { movies } = props;

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
            props.castVote(movieId);
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