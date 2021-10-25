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

import { 
    VotableMovies, 
    VotableMovie 
} from '../../../types';


import DisplayTable from '../../shared/DisplayTable/DisplayTable';

import '../../../sass/movies.scss';

type VoteProps = {
    movies: VotableMovies;
    submitVote: (movieId: string) => {}
}

const Vote: React.FC<VoteProps> = (props) => {
    const [ isLoadingMovies, setIsLoadingMovies ] = useState<boolean>(false);

    const { movies } = props;

    useEffect(() => {
        setIsLoadingMovies(false);
    }, [props.movies]);

    const addVote = (event: any) => {
        const { name: title }: { name: string } = event.target;
        if (title) {
            let movieId: string = "";

            for (let i = 0; i < Object.keys(movies).length; i++) {
                const id = Object.keys(movies)[i];
                const movie = movies[id];

                if (movie.title === title) {
                    movieId = id;
                    break;
                }
            }

            if (movieId !== "") {
                setIsLoadingMovies(true);
                props.submitVote(movieId);
            }
        }
    }

    const _filterMovies = async (searchText: string) => {
        const newMovies: VotableMovies = {};
        
        Object.keys(movies).forEach(movieKey => {
            const movie = movies[movieKey];

            if (movie.title.trim().toLowerCase().indexOf(searchText.trim().toLowerCase()) > -1) {
                newMovies[movieKey] = movie;
            }
        });
        
        return newMovies;
    }

    if (movies) {
        return (
            <DisplayTable
                rowData={movies}
                isLoadingData={isLoadingMovies}
                tableHeaders={[
                    {
                        size: 'small',
                        label: 'Poster'
                    },
                    {
                        align: 'left',
                        label: 'Movie Name'
                    },
                    {
                        size: 'small',
                        label: 'Total Votes'
                    },
                    {
                        label: 'Add Your Vote?'
                    }
                ]}
                tableCells={[
                    {
                        class: 'poster-cell',
                        size: 'small',
                        component: 'th',
                        scope: 'row',
                        cellRenderer: (item: any) => {
                            return <img src={item.poster} />
                        } 
                    },
                    {
                        class: 'title-cell',
                        align: 'left',
                        valueGetter: (item: any) => {
                            return item.title;
                        }
                    },
                    {
                        size: 'small',
                        valueGetter: (item: any) => {
                            return Object.keys(item.voted || {}).length
                        }
                    },
                    {
                        padding: 'checkbox',
                        cellRenderer: (item: any) => {
                            return <Checkbox icon={<MovieOutlinedIcon />} checkedIcon={<MovieIcon />} name={item.title} title={item.title} onClick={addVote} />
                        }
                    }
                ]}
                itemName="movie"
                tableId="votable movies"
                searchLabel="Search for a movie"
                filterResults={_filterMovies}
                paginationProps={{
                    count: Object.keys(movies).length
                }}
            />
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