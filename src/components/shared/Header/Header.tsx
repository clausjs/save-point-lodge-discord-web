import React, { useState, useEffect, useLayoutEffect } from 'react';
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

import { fetchUserAuthorization, isMoviegoer, isSPLMember } from '../../../actions';

import { RootState } from '../../../reducers';
import { UserState, User } from '../../../types';

import {
    PageViews,
    View,
    HeaderProps
} from '../../../types';

import '../../../sass/_globals.scss';

const views: PageViews = {
    Home: {
        to: "/"
    },
    "Bots on SPL": {
        to: "/our-bots"
    },
    Commands: {
        to: "/commands",
        disabled: false
    },
    Movies: {
        to: "/movies",
        requiresAuth: true,
        requiresMoviegoer: true
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
    const [ view, setView ] = useState<number | false>(0);
    const [ tabs, setTabs ] = useState(null);
    const [ authAnchorEl, setAuthAnchorEl ] = useState<Element | ((element: Element) => Element) | null>(null);
    const userState: UserState = useSelector((state: RootState) => state.user);
    const history = useHistory();
    const authMenuOpen: boolean = Boolean(authAnchorEl);
    const currentLoc: string = useLocation().pathname;

    const { user, isMoviegoer, isLodgeGuest }: { user: User, isMoviegoer: boolean, isLodgeGuest: boolean } = userState;

    useLayoutEffect(() => {
        if (userState.status === 'idle') {
            props.getAuth();
            props.getMoviegoerStatus();
            props.getGuestStatus();
        }
    });
    
    useEffect(() => {
        const actualView = Object.values(views).findIndex(view => view.to === currentLoc);
        if (actualView === -1) {
            handleNavigation(null, false);
        } else if (actualView !== view) {
            handleNavigation(null, actualView);
        }
    }, [view]);

    useEffect(() => {
        const _tabs = [];
        for (let i = 0; i < Object.keys(views).length; i++) {
            const viewName = Object.keys(views)[i];
            const page: View = views[viewName];
            if (page.requiresAuth && user === null) {
                continue;
            }

            if (page.requiresMoviegoer && !isMoviegoer) continue;

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


            _tabs.push(<LinkTab key={i} label={label} href={page.to} disabled={page.disabled} />);
        }
        setTabs(_tabs);
    }, [user, isLodgeGuest, isMoviegoer]);

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    const handleNavigation = (event: any, newView: number | false) => {
        setView(newView);
        if (newView !== false) history.push(Object.values(views)[newView].to);
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
                                {tabs}
                            </Tabs>
                        </div>
                        {user !== null && (
                            <div className='acct'>
                                <IconButton
                                    aria-label={`${user.username}'s Account'`}
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    color="inherit"
                                    onClick={handleAuthMenu}
                                >
                                    {/* {userState.status === 'loading' && <MoonLoader size={20} />} */}
                                    {userState.status === 'succeeded' && user.avatar && <img className='acct-icon' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`} />}
                                    {userState.status === 'succeeded' && user.avatar === null && <AccountCircle />}
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
                                    {user && isLodgeGuest === true && (
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
            onClick={(e: any) => { e.preventDefault(); }}
            {...props}
        />
    )
};

const mapStateToProps = (state: RootState) => {
    const { user } = state.user;
    return { user }
};

const mapDispatchToProps = (dispatch: any) => ({
    getAuth: () => dispatch(fetchUserAuthorization()),
    getMoviegoerStatus: () => dispatch(isMoviegoer()),
    getGuestStatus: () => dispatch(isSPLMember())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);