import React, { useState, useEffect, useLayoutEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { useLocation, useHistory, Link } from "react-router-dom";

import {
    AppBar,
    SwipeableDrawer,
    Container,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    Menu,
    MenuItem
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';

import ThemeSwitch from './ThemeSwitch';

import { 
    HeaderProps,
    MobilePageLink,
    User,
    UserState 
} from '../../../types';

import { fetchUserAuthorization, isMoviegoer, isSPLMember } from '../../../actions';
import {
    RootState
} from '../../../reducers';

import '../../../sass/_globals.scss';

import { AllPages as views } from './Views';
import { AccountCircle, Launch } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 0,
    }
}));

const MobileHeader: React.FC<HeaderProps> = (props) => {
    const classes = useStyles();
    const [ view, setView ] = useState<number | false>(0);
    const [ links, setLinks ] = useState<React.ReactNode[]>([]);
    const [ navMenuOpen, setNavMenuOpen ] = useState<boolean>(false);
    const [ authAnchorEl, setAuthAnchorEl ] = useState<Element | ((element: Element) => Element) | null>(null);
    const userState: UserState = useSelector((state: RootState) => state.user);
    const authMenuOpen: boolean = Boolean(authAnchorEl);
    const history = useHistory();
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
        const links: React.ReactNode[] = [];
        for (let i = 0; i < Object.keys(views).length; i++) {
            const viewName = Object.keys(views)[i];
            const view: MobilePageLink = views[viewName] as MobilePageLink;
            if (view.requiresAuth && user === null) continue;
            if (view.requiresMoviegoer && !isMoviegoer) continue;

            if (view.label) {
                links.push(
                    <ListItem
                    key={i}
                    className='list-item label'
                    onClick={(event) => {}}
                    >
                        <div className='account-section'>
                            <div onClick={(e) => handleNavigation(e, i)}>{view.label}</div>
                            {user !== null && (
                                    <div className='acct'>
                                        <IconButton
                                            className='icon-btn'
                                            aria-label={`${user.username}'s Account'`}
                                            aria-controls="menu-appbar"
                                            aria-haspopup="true"
                                            color="inherit"
                                            onClick={handleAuthMenu}
                                        >
                                            {userState.status === 'succeeded' && user.avatar && <img className='acct-icon' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`} />}
                                            {userState.status === 'succeeded' && user.avatar === null && <AccountCircle />}
                                        </IconButton>
                                    </div>
                                )}
                                {user === null && (
                                    <div className='acct'>
                                        <Button
                                            className='btn'
                                            size='small'
                                            color='default'
                                            variant="outlined"
                                            href="/login"
                                        >Login</Button>
                                    </div>
                                )}
                        </div>
                    </ListItem>
                )
            } else {
                links.push(
                    <ListItem
                        key={i}
                        selected={view.to === currentLoc}
                        className='list-item'
                        onClick={(event) => handleNavigation(event, i)}
                    >
                        <ListItemIcon style={{ color: 'inherit' }}>
                            {view.icon}
                        </ListItemIcon>
                        {view.externalSite ? <ListItemText>
                            <span className='external-site-link'>{viewName}<Launch className='external-launch-ico' /></span>
                        </ListItemText> : <ListItemText primary={viewName} />}
                    </ListItem>
                )
            }
        }
        setLinks(links);
    }, [user, isLodgeGuest, isMoviegoer]);

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    const handleNavigation = (event: any, newView: number | false) => {
        if (newView !== false && newView === Object.keys(views).findIndex(view => view === 'Subscribe')) return;

        setView(newView);
        if (newView !== false) {
            setNavMenuOpen(false);
            history.push(Object.values(views)[newView].to);
        }
    }

    return (
        <div className={classes.root}>
            <AppBar position='static' className='spl-header mobile' color='inherit'>
                <Grid container className='header-content' justifyContent='flex-start'>
                    <MenuIcon className='nav-menu-button' onClick={() => setNavMenuOpen(true)} />
                </Grid>
            </AppBar>
            <SwipeableDrawer
                className='nav-menu'
                variant='temporary'
                anchor='left'
                open={navMenuOpen}
                onClose={() => setNavMenuOpen(false)}
                onOpen={() => setNavMenuOpen(true)}
                PaperProps={{ className: 'menu-container' }}
            >
                <Container className='menu-content' maxWidth={false} disableGutters>
                    <MenuIcon className='nav-menu-button' onClick={() => setNavMenuOpen(false)} />
                    <Menu
                        id="account-menu"
                        variant="menu"
                        anchorEl={authAnchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left"
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left"
                        }}
                        open={authMenuOpen}
                        onClose={handleAuthMenuClose}
                    >
                        {user && isLodgeGuest === true && (
                            <MenuItem 
                                onClick={(e) => {
                                    handleAuthMenuClose();
                                    setNavMenuOpen(false);
                                    handleNavigation(e, false);
                                }}
                            >
                                <Link to="/members">Discord Options</Link>
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleAuthMenuClose}><a href="/logout">Logout</a></MenuItem>
                    </Menu>
                    <List className='nav-menu-items'>
                        {links}
                    </List>    
                </Container>        
            </SwipeableDrawer> 
        </div>
    );
}

const mapStateToProps = (state: RootState) => {
    const { user } = state.user;
    return { user }
};

const mapDispatchToProps = (dispatch: any) => ({
    getAuth: () => dispatch(fetchUserAuthorization()),
    getMoviegoerStatus: () => dispatch(isMoviegoer()),
    getGuestStatus: () => dispatch(isSPLMember())
});

export default connect(mapStateToProps, mapDispatchToProps)(MobileHeader);