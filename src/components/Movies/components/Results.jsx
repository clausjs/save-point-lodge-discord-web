import React, { useState, useEffect } from 'react';

import {
    CircularProgress,
    Typography,
    Box
} from '@material-ui/core';

import DisplayTable from '../../shared/DisplayTable/DisplayTable.tsx';

import fetch from 'node-fetch';

import '../../../sass/movies.scss';

function CircularProgressWithLabel(props) {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

const Results = () => {
    const [ movieStats, setMovieStats ] = useState(null);

    useEffect(() => {
        if (movieStats === null) {
            fetch('/api/movies/movie-stats').then(res => res.json()).then(data => {
                setMovieStats(data);
            }).catch(err => {
                console.error(err);
            });
        }
    }, [movieStats]);

    let tableHeaders, tableCells;
    if (movieStats !== null) {
        const { totalMoviegoers: totalVoters } = movieStats;

        tableHeaders = [
            {
                label: 'Poster',
                size: 'small'
            },
            {
                label: 'Movie Title',
                align: 'left',
                class: 'title-cell'
            },
            {
                label: `Overall - ${totalVoters} total voters`,
                size: 'small'
            }
        ];

        tableCells = [
            {
                class: 'poster-cell',
                size: 'small',
                component: 'th',
                scope: 'row',
                valueGetter: (item) => {
                    return <img title={item.title} src={item.poster} />
                }
            },
            {
                class: 'title-cell',
                align: 'left',
                field: 'title'
            },
            {
                size: 'small',
                class: 'overall-ratio',
                valueGetter: (item) => {
                    const votes = Object.keys(item.voted).length;

                    return (
                        <div className='ratio-inner'>
                            <span>{votes}</span>
                            <CircularProgressWithLabel value={(votes / totalVoters) * 100} />
                        </div>
                    );
                }
            }
        ];
    }

    const filterResults = (searchText) => {
        if (searchText && searchText.length >= 2) {
            const _newViewing = {};
            Object.keys(movieStats.movies).map(movieKey => {
                if (movieKey.toLowerCase().includes(searchText.toLowerCase())) {
                    _newViewing[movieKey] = movieStats.movies[movieKey];
                }
            });
            setMovieStatsViewing(_newViewing);
        } else {
            setMovieStatsViewing(movieStats.movies);
        }
    }

    return (
        <div className="movie-results">
            {movieStats !== null && tableHeaders !== null && tableCells !== null && (
                <DisplayTable
                    rowData={movieStats.movies}
                    tableHeaders={tableHeaders}
                    tableCells={tableCells}
                    itemName="movies"
                    tableId="results-table"
                    searchLabel="Search for movie"
                    filterResults={filterResults} 
                    paginationProps={{ 
                        count: Object.keys(movieStats.movies).length
                    }}
                />
            )}
        </div>
    );
}

export default Results;