import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchUserAuthorization, fetchVotableMovies, fetchMovieStats, submitVote } from '../../actions';

import {
    Paper,
    Grid,
    AppBar,
    Tabs,
    Tab
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Movies = (props) => {
    const classes = useStyles();

    const [ fetchedMovies, setFetchedMovies ] = useState(false);
    const [ fetchedMovieStats, setFetchedMovieStats ] = useState(false);
    const [ isLoadingStats, setIsLoadingStats ] = useState(true);
    const [ value, setValue ] = useState(0);

    const { user: auth, movies, stats } = props;

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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={`${classes.root} movie-content`}>
            {(!auth || !auth.isMoviegoer) && (
                <h4 className="not_authorized">Sorry, you must be a member of planet express and in the appropriate group to use this page.</h4>
            )}
            {auth && auth.isMoviegoer && (
                <Grid container className='movie-grid'>
                    <Grid item xs={3}>
                        <AppBar color='transparent' position="static">
                            <Tabs value={value} onChange={handleChange} aria-label="movie database viewer tabs">
                                <Tab label="Vote" {...a11yProps(0)} />
                                <Tab label="Results" {...a11yProps(1)} />
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

const mapStateToProps = (state) => {
    const { user } = state.user;
    const { votable, stats } = state.movies;
    return { user, stats, movies: votable };
}

const mapDispatchToProps = (dispatch) => ({
    getMovies: () => dispatch(fetchVotableMovies()),
    getMovieResults: () => dispatch(fetchMovieStats()),
    castVote: () => dispatch(submitVote())
});

export default connect(mapStateToProps, mapDispatchToProps)(Movies);