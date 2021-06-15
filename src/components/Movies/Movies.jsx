import React, { useState, useLayoutEffect, useEffect } from 'react';
import fetch from 'node-fetch';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TabPanel from './components/TabPanel.jsx';
import Watch from './components/Watch.jsx';
import Vote from './components/Vote.jsx';
import Results from './components/Results.jsx';
import AddNew from './components/AddNew.jsx';

import "../../sass/movies.scss";

const useStyles = makeStyles((theme) => ({
    body: {
        maxHeight: "800px"
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Movies = () => {
    const classes = useStyles();

    const [ auth, setAuth ] = useState(null);
    const [ value, setValue ] = useState(0);

    useLayoutEffect(() => {
        if (auth === null) {
            fetch('/api/user').then(res => res.json()).then(data => {
                setAuth(data);
            }).catch(err => {
                console.error(err);
                setAuth(null);
            });
        }
    }, [auth]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={classes.root}>
            {(!auth || !auth.isMoviegoer) && (
                <h4 className="not_authorized">Sorry, you must be a member of planet express and in the appropriate group to use this page.</h4>
            )}
            {auth && auth.isMoviegoer && (
                <Grid container>
                    <Grid item xs={3}>
                        <AppBar color='transparent' position="static">
                            <Tabs value={value} onChange={handleChange} aria-label="movie database viewer tabs">
                                <Tab label="Vote" {...a11yProps(0)} />
                                <Tab label="Results" {...a11yProps(1)} />
                                <Tab label="Request New" {...a11yProps(2)} />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={value} index={0}>
                            <Vote auth={auth} />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <Results />
                        </TabPanel>
                        <TabPanel value={value} index={2}>
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

export default Movies;