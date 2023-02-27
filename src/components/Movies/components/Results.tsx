import React from 'react';

import {
    CircularProgress,
    Typography,
    Box
} from '@material-ui/core';

import {
    MovieResults,
    MovieStats
} from '../../../types';

import DisplayTable from '../../shared/DisplayTable/DisplayTable';

import '../../../sass/movies.scss';

interface CircularProgressWithLabelProps {
    value: number;
    children?: React.ReactNode;
}

function CircularProgressWithLabel(props: CircularProgressWithLabelProps) {
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

interface ResultsProps {
    stats: MovieStats;
    isLoading: boolean;
}

const Results: React.FC<ResultsProps> = (props) => {
    const { stats: movieStats, isLoading } = props;

    const filterResults = async (searchText: string) => {
        const newMovies: MovieResults = {};

        Object.keys(movieStats.movies).map(movieKey => {
            if (movieKey.toLowerCase().includes(searchText.toLowerCase())) {
                newMovies[movieKey] = movieStats.movies[movieKey];
            }
        });

        return newMovies;
    }

    const { totalMoviegoers: totalVoters } = movieStats;

    return (
        <div className="movie-results">
            {movieStats !== null && (
                <DisplayTable
                    rowData={movieStats.movies}
                    tableHeaders={[
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
                    ]}
                    tableCells={[
                        {
                            class: 'poster-cell',
                            size: 'small',
                            component: 'th',
                            scope: 'row',
                            valueGetter: (item: any) => {
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
                            valueGetter: (item: any) => {
                                const votes = Object.keys(item.voted).length;
            
                                return (
                                    <div className='ratio-inner'>
                                        <span>{votes}</span>
                                        <CircularProgressWithLabel value={(votes / totalVoters) * 100} />
                                    </div>
                                );
                            }
                        }
                    ]}
                    itemName="movies"
                    tableId="results-table"
                    searchLabel="Search for movie"
                    filterResults={filterResults}
                    isLoadingData={isLoading || (!movieStats.movies)} 
                    paginationProps={{ 
                        count: Object.keys(movieStats.movies).length
                    }}
                />
            )}
        </div>
    );
}

export default Results;