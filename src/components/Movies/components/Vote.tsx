import React from 'react';

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
    const { movies } = props;

    const addVote = (event: any) => {
        const { name: movieId }: { name: string } = event.target;

        if (movieId) {
            props.submitVote(movieId);
        }
    }

    if (movies) {
        return (
            <DisplayTable
                rowData={movies}
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
                            return <Checkbox icon={<MovieOutlinedIcon />} checkedIcon={<MovieIcon />} name={item.id} title={item.title} onClick={addVote} />
                        }
                    }
                ]}
                itemName="movie"
                tableId="votable movies"
                searchLabel="Search for a movie"
                filterResults={() => ([])}
                isLoadingData={false}
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