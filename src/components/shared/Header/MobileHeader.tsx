import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from "react-router-dom";

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
    MenuItem,
    createTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import ThemeSwitch from './ThemeSwitch';

import { 
    apiState,
    PageLink,
    User,
    UserState 
} from '../../../types';

// import { fetchUserAuthorization, isMoviegoer, isSoundboardMember, isSPLMember } from '../../../actions';
// import { fetch }
// import {
//     RootState
// } from '../../../store/configureStore';
import { AppDispatch, RootState } from '../../../state/store';

import '../../../sass/_globals.scss';

import { AllPages as views } from './Views';
import { AccountCircle, Cancel, Launch } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { fetchUser, login } from '../../../state/reducers/user';
import { HeaderProps } from './Header';

const MobileHeader: React.FC<HeaderProps> = ({
    classes,
    pages,
    handleNavigation
}) => {
    const dispatch = useDispatch<AppDispatch>();
    // const [ view, setView ] = useState<number | false>(0);
    // const [ links, setLinks ] = useState<React.ReactNode[]>([]);
    const [ navMenuOpen, setNavMenuOpen ] = useState<boolean>(false);
    const [ authAnchorEl, setAuthAnchorEl ] = useState<Element | (() => Element) | null>(null);
    const [ authIconUrl, setAuthIconUrl ] = useState<string | null>(null);
    const authMenuOpen: boolean = Boolean(authAnchorEl);
    
    const user: User | null = useSelector((state: RootState) => state.user.user);
    const userFetchState: apiState = useSelector((state: RootState) => state.user.userFetchState);

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    useEffect(() => {
        if (userFetchState === 'fulfilled') {
            if (user.avatarUrl) {
                setAuthIconUrl(user.avatarUrl);
            }
            else if (user.avatar) {
                setAuthIconUrl(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`);
            }
        }
    }, [userFetchState]);

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
                    <Container className='content-top' maxWidth={false} disableGutters>
                        <MenuIcon className='nav-menu-button' onClick={() => setNavMenuOpen(false)} />
                        <Cancel onClick={() => setNavMenuOpen(false)} />
                    </Container>
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
                        {user && user.isPlanetExpressMember === true && (
                            <MenuItem 
                                onClick={(e) => {
                                    handleAuthMenuClose();
                                    setNavMenuOpen(false);
                                    handleNavigation(e);
                                }}
                            >
                                <Link to="/members">Discord Options</Link>
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleAuthMenuClose}><a href="/logout">Logout</a></MenuItem>
                    </Menu>
                    <List className='nav-menu-items'>
                        <ListItem
                        key={-1}
                        className='list-item label'
                        onClick={(event) => {}}
                        >
                            <div className='account-section'>
                                {/* @ts-ignore */}
                                <div onClick={(e) => handleNavigation({...e, target: { ...e.target, name: 'Home' } })}><img src='/img/logo.png' /></div>
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
                                                {user && authIconUrl && <img style={user.avatarUrl ? { height: '32px', width: '32px' } : {} } className='acct-icon' src={authIconUrl} />}
                                                {user && !authIconUrl && <AccountCircle />}
                                            </IconButton>
                                        </div>
                                    )}
                                    {user === null && (
                                        <div className='acct'>
                                            <Button
                                                className='btn'
                                                size='small'
                                                variant="contained"
                                                onClick={() => dispatch(login())}
                                                loading={userFetchState === 'pending'}
                                            >Login</Button>
                                        </div>
                                    )}
                            </div>
                        </ListItem>
                        {pages.map((page, index) => {
                            return (
                                <ListItem
                                    key={index}
                                    className='list-item'
                                    onClick={(event: React.MouseEvent) => {
                                        setNavMenuOpen(false);
                                        if (page.external) {
                                            window.open(page.href, "_blank");
                                        } else handleNavigation(event)
                                    }}
                                >
                                    <IconButton name={page.name}>{page.icon} {page.name}</IconButton>
                                </ListItem>
                            )
                        })}
                    </List>
                    <div className='theme-switch'><ThemeSwitch /></div>    
                </Container>        
            </SwipeableDrawer> 
        </div>
    );
}

export default MobileHeader;