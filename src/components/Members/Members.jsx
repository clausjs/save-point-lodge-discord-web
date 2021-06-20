import React, { useEffect, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles({
  table: {
    minWidth: 300,
  },
});

import fetch from 'node-fetch';

import '../../sass/members.scss';

const Members = () => {
    const [ user, setUser ] = useState(null);
    const [ userOpts, setUserOpts ] = useState(null);
    const [ optsDescriptions, setOptsDescriptions ] = useState(null);

    const classes = useStyles();

    useEffect(() => {
        if (user === null) {
            fetch('/api/user').then(res => {
                if (res.status === 200) return res.json();
                else return null;
            }).then(data => {
                setUser(data);
            }).catch(err => {
                console.error(err);
            });
        }
    });

    useEffect(() => {
        if (userOpts === null) {
            fetch('/api/user/opts').then(res => {
                if (res.status === 200) return res.json();
                else return {};
            }).then(optionsData => {
                if (optsDescriptions === null) {
                    fetch('/api/user/opts/descriptions').then(res => res.json()).then(descriptions => {
                        for (const optKey in descriptions) {
                            if (!optionsData.hasOwnProperty(optKey)) {
                                optionsData[optKey] = false;
                            }
                        }
                        setOptsDescriptions(descriptions);
                        setUserOpts(optionsData);
                    }).catch(err => {
                        console.error(err);
                    });
                } else {
                    setUserOpts(optionsData);
                }
            }).catch(err => {
                console.error(err);
            })
        }
    }, [user]);

    const toggleOption = (event) => {
        const userOptions = userOpts;
        const option = event.target.attributes['aria-label'].value;
        delete userOptions.descriptions;
        userOptions[option] = !userOptions[option];
        fetch('/api/user/opts', {
            method: 'POST',
            body: JSON.stringify(userOptions),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then(returnedOpts => {
            setUserOpts(returnedOpts);

        }).catch(err => {
            console.error(err);
        });
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="md">
                <Typography component="div" style={{ backgroundColor: '#ffffff' }} />
                {!user && (
                    <div className="member-main">
                        <h3>You must login with discord to continue. <a href="/login">Click here</a></h3>
                    </div>
                )}
                {user && (
                    <div className="member-main">
                        <h1>Welcome {user.username}!</h1>
                        {userOpts && (
                            <>
                                <p>Below is a list of item that you can toggle that are specific to your user on Planet Express Discord:</p>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                        <TableRow>
                                            <TableCell>Option</TableCell>
                                            <TableCell align="center">Description</TableCell>
                                            <TableCell align="right">Toggle</TableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {Object.keys(userOpts).map((optKey) => {
                                            if (optKey === 'descriptions') return null;
                                            return(
                                                <TableRow key={optKey}>
                                                    <TableCell component="th" scope="row">
                                                        {optKey}
                                                    </TableCell>
                                                    <TableCell>{optsDescriptions[optKey]}</TableCell>
                                                    <TableCell name={optKey} align="right"><Switch inputProps={{ 'aria-label': optKey }} checked={userOpts[optKey]} onChange={toggleOption}></Switch></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </div>
                )}
            </Container>
        </React.Fragment>
    );
}

export default Members;