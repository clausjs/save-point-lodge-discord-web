import React, { useState, useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

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

    return (
        <div>
            {movieStats && (
                Object.values(movieStats.movies).map((movie, i) => {
                    const voteCount = Object.keys(movie.voted).length;
                    const result = (voteCount / movieStats.totalMoviegoers) * 100;
                    return (
                        <div key={i} className="result-item">
                            <CircularProgressWithLabel value={result} />
                            <span>{movie.title}</span>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Results;