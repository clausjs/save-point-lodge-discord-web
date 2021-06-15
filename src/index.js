import React, { useState, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import fetch from 'node-fetch';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));

//Views
import Home from "./components/Home/Home.jsx";
import Bots from './components/Bots/Bots.jsx';
import Members from "./components/Members/Members.jsx";
import Movies from './components/Movies/Movies.jsx';

const views = {
    Home: {
        to: "/"
    },
    "Our Bots": {
        to: "/our-bots"
    }
}

const pages = {
    "/": "Home",
    "/our-bots": "Our Bots",
    "/members": "Member Options",
    "/movies": "Movies"
};

const Navigation = () => {

    const classes = useStyles();
    const [ auth, setAuth ] = useState(null);
    const [ authAnchorEl, setAuthAnchorEl ] = useState(null);
    const [ navAchorEl, setNavAnchorEl ] = useState(null);
    const authMenuOpen = Boolean(authAnchorEl);
    const navMenuOpen = Boolean(navAchorEl);

    useLayoutEffect(() => {
        if (!auth) {
            fetch('/api/user').then(res => {
                if (res.status === 200) return res.json();
                else return null;
            }).then(data => {
                if (data) {
                    setAuth(data);
                }
            }).catch(err => {
                console.error(err);
            });
        }
    });

    const handleAuthMenu = (event) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    const handleNavManu = (event) => {
        setNavAnchorEl(event.currentTarget);
    }

    const handleNavMenuClose = () => {
        setNavAnchorEl(null);
    }

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon
                            aria-label="Navigation"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleNavManu}
                            color="inherit"
                        ></MenuIcon>
                        <Menu
                            id="nav-menu"
                            anchorEl={navAchorEl}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "left"
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left"
                            }}
                            open={navMenuOpen}
                            onClose={handleNavMenuClose}
                        >
                            {Object.keys(views).map((viewName, i) => {
                                const view = views[viewName];
                                return (
                                    <MenuItem key={i} onClick={handleNavMenuClose}><Link to={view.to}>{viewName}</Link></MenuItem>
                                );
                            })}
                        </Menu>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {pages[useLocation().pathname] || "Planet Express Discord"}
                    </Typography>
                    {auth && (
                        <div>
                            <IconButton
                                aria-label={`${auth.username}'s Account'`}
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                            >
                                <AccountCircle onClick={handleAuthMenu} />
                            </IconButton>
                            <Menu
                                id="account-menu"
                                anchorEl={authAnchorEl}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right"
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right"
                                }}
                                open={authMenuOpen}
                                onClose={handleAuthMenuClose}
                            >
                                {auth && auth.isPlanetExpressMember && (
                                    <MenuItem onClick={handleAuthMenuClose}><Link to="/members">Member Options</Link></MenuItem>
                                )}
                                {auth && auth.isMoviegoer && (
                                    <MenuItem onClick={handleAuthMenuClose}><Link to="/movies">Planet Express Movies</Link></MenuItem>
                                )}
                                <MenuItem onClick={handleAuthMenuClose}><a href="/logout">Logout</a></MenuItem>
                            </Menu>
                        </div>
                    )}
                    {!auth && (
                        <div>
                            <Button
                                variant="contained"
                                href="/login"
                            >Login</Button>
                        </div>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
}

const App = () => {
    return (
        <Router>
            <Navigation />
            <Switch>
                <Route path="/" exact>
                    <Home />
                </Route>
                <Route path="/our-bots">
                    <Bots />
                </Route>
                <Route path="/members">
                    <Members />
                </Route>
                <Route path="/movies">
                    <Movies />
                </Route>
            </Switch>
        </Router>
    );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);