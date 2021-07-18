import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { useLocation, Link, useHistory } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Tabs,
    Tab,
    Menu,
    MenuItem,
    Button,
    IconButton
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import { fetchUserAuthorization } from '../../../actions';
import { RootState } from '../../../reducers';
import { UserState, User } from '../../../../types';

import {
    PageViews,
    View,
    HeaderProps
} from '../../../../types';

import '../../../sass/_globals.scss';

const initialViews: PageViews = {
    Home: {
        to: "/"
    },
    "Bots on SPL": {
        to: "/our-bots"
    },
    "Commands": {
        to: "/commands",
        disabled: true,
        ancillary: {
            class: 'super',
            content: "Coming Soon!!"
        }
    },
    "Movies": {
        to: "/movies",
        requiresAuth: true
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 0,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        maxWidth: '33%'
    }
}));

const Header: React.FC<HeaderProps> = (props) => {
    const classes = useStyles();
    const [ fetchedAuth, setFetchedAuth ] = useState<boolean>(false);
    const [ views, setViews ] = useState<PageViews>(initialViews);
    const [ view, setView ] = useState<number>(0);
    const [ authAnchorEl, setAuthAnchorEl ] = useState(null);
    const user = useSelector((state: RootState) => state.user.user);
    const history = useHistory();
    const authMenuOpen = Boolean(authAnchorEl);
    const currentLoc = useLocation().pathname;

    useEffect(() => {
        if (user === null) {
            if (fetchedAuth) {
                setViews(initialViews);
            } else {
                props.getAuth();
                setFetchedAuth(true);
            }
        }
    });
        
    // useEffect(() => {      
    //     console.log("USER HAS CHANGED, RERENDERING: ", user, views);  
    //     if (user !== null && !views.hasOwnProperty('Movies')) {
    //         const newViews = initialViews;
    //         newViews["Movies"] = {
    //             to: "/movies"
    //         };
    //         setViews(newViews);
    //     }
    // }, [user])
    
    useEffect(() => {
        const actualView = Object.values(views).findIndex(view => view.to === currentLoc);
        if (actualView !== view) {
            handleNavigation(null, actualView);
        }
    }, [view])

    const generateTabs = () => {
        const tabs = [];
        for (let i = 0; i < Object.keys(views).length; i++) {
            const viewName = Object.keys(views)[i];
            const page: View = views[viewName];
            if (page.requiresAuth && user === null) {
                continue;
            }

            let label: React.ReactNode | string;

            if (page.ancillary) {
                label = (
                    <div className='tab-label'>
                        <span className='view'>{viewName}</span>
                        {typeof page.ancillary.content === 'string' ? 
                            <span className={page.ancillary.class}>{page.ancillary.content}</span>
                        :
                            <>{page.ancillary.content}</>
                        }
                    </div>
                );
            } else {
                label = viewName;
            }


            tabs.push(<LinkTab key={i} label={label} href={page.to} disabled={page.disabled} />);
        }
        return tabs;
    }

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    const handleNavigation = (event: any, newView: number) => {
        setView(newView);
        history.push(Object.values(views)[newView].to);
    }

    return (
        <div className={classes.root}>
            <AppBar className="spl-header" position="static" color="inherit">
                <Toolbar>
                    <div className='header-content'>
                        <div className='nav-tabs'>
                            <Tabs 
                                variant='fullWidth'
                                value={view}
                                onChange={handleNavigation}
                                aria-label='nav tabs'
                            >
                                {generateTabs()}
                            </Tabs>
                        </div>
                        {user !== null && (
                            <div className='acct'>
                                <IconButton
                                    aria-label={`${user.username}'s Account'`}
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    color="inherit"
                                >
                                    <img className='acct-icon' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.includes('a_') ? 'gif' : 'png'}?size=32`} onClick={handleAuthMenu} />
                                </IconButton>
                                <Menu
                                    id="account-menu"
                                    variant="menu"
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
                                    {user && user.isPlanetExpressMember && (
                                        <MenuItem onClick={handleAuthMenuClose}><Link to="/members">Discord Options</Link></MenuItem>
                                    )}
                                    <MenuItem onClick={handleAuthMenuClose}><a href="/logout">Logout</a></MenuItem>
                                </Menu>
                            </div>
                        )}
                        {user === null && (
                            <div className='acct'>
                                <Button
                                    variant="contained"
                                    href="/login"
                                    startIcon={<AccountCircle />}
                                >Login</Button>
                            </div>
                        )}
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
};

const LinkTab = (props: any) => {
    return (
        <Tab
            component="a"
            onClick={(e) => { e.preventDefault(); }}
            {...props}
        />
    )
};

const mapStateToProps = (state: RootState) => {
    const { user } = state.user;
    return { user }
};

const mapDispatchToProps = (dispatch: any) => ({
    getAuth: () => dispatch(fetchUserAuthorization())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);