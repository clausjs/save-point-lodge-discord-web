import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchVotableMovies, fetchMovieStats, submitVote } from '../../actions';

import {
    Grid,
    AppBar,
    Tabs,
    Tab
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import {
    User,
    MovieStats,
    VotableMovies,
    MovieResults,
    MovieState
} from '../../types';
import { RootState } from '../../reducers';

import TabPanel from './components/TabPanel';
import Watch from './components/Watch';
import Vote from './components/Vote';
import Results from './components/Results';
import AddNew from './components/AddNew';

import "../../sass/movies.scss";


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    }
}));

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

type MoviesProps = {
    user: User | null;
    isMoviegoer: boolean; 
    movies: VotableMovies; 
    stats: MovieStats; 
    getMovies: Function; 
    getMovieResults: Function; 
    castVote: (movieId: string) => {}
}

const Movies: React.FC<MoviesProps> = (props) => {
    const classes = useStyles();

    const [ fetchedMovies, setFetchedMovies ] = useState<boolean>(false);
    const [ fetchedMovieStats, setFetchedMovieStats ] = useState<boolean>(false);
    const [ isLoadingStats, setIsLoadingStats ] = useState<boolean>(true);
    const [ value, setValue ] = useState(0);

    const { user: auth, isMoviegoer, movies, stats } = props;

    useEffect(() => {
        if (!fetchedMovies) {
            props.getMovies();
            setFetchedMovies(true);
        }

        if (value === 1 && !fetchedMovieStats) {
            props.getMovieResults();
            setFetchedMovieStats(true);
        }
    });

    useEffect(() => {
        if (fetchedMovieStats) setIsLoadingStats(false);
    }, [stats])

    const handleChange = (event: any, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div className={`${classes.root} movie-content`}>
            {(!auth || !isMoviegoer) && (
                <h4 className="not_authorized">Sorry, you must be a member of planet express and in the appropriate group to use this page.</h4>
            )}
            {auth && isMoviegoer && (
                <Grid container className='movie-grid'>
                    <Grid item xs={3}>
                        <AppBar color='transparent' position="static">
                            <Tabs value={value} onChange={handleChange} aria-label="movie database viewer tabs">
                                <Tab label="Vote" {...a11yProps(0)} />
                                <Tab label="Statistics" {...a11yProps(1)} />
                                <Tab label="Request New" {...a11yProps(2)} />
                            </Tabs>
                        </AppBar>
                        <TabPanel className={"interaction-panel"} value={value} index={0}>
                            <Vote movies={movies} submitVote={props.castVote} />
                        </TabPanel>
                        <TabPanel className={"interaction-panel"} value={value} index={1}>
                            <Results stats={stats} isLoading={isLoadingStats} />
                        </TabPanel>
                        <TabPanel className={"interaction-panel"} value={value} index={2}>
                            <AddNew />
                        </TabPanel>
                    </Grid>
                    <Grid item xs={9}>
                        <Watch auth={auth} />
                    </Grid>
                </Grid>
            )}
        </div>
    );
}

const mapStateToProps = (state: RootState): { user: User; isMoviegoer: boolean; stats: MovieStats; movies: VotableMovies } => {
    const { user, isMoviegoer  }: { user: User, isMoviegoer: boolean } = state.user;
    const { votable, stats }: { votable: VotableMovies; stats: MovieStats } = state.movies;
    return { user, isMoviegoer, stats, movies: votable };
}

const mapDispatchToProps = (dispatch: any): object => ({
    getMovies: () => dispatch(fetchVotableMovies()),
    getMovieResults: () => dispatch(fetchMovieStats()),
    castVote: (movieId: string) => dispatch(submitVote(movieId))
});

export default connect(mapStateToProps, mapDispatchToProps)(Movies);