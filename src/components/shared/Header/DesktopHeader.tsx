import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link, useNavigate } from "react-router";

import {
    AppBar,
    Toolbar,
    Tab,
    Menu,
    MenuItem,
    Button,
    IconButton,
    Box
} from '@mui/material';
import { AccountCircle, Launch } from '@mui/icons-material';

import { AppDispatch, RootState } from '../../../state/store';

import {
    apiState,
    PageLink,
    User
} from '../../../types';

import '../../../sass/_globals.scss';
import ThemeSwitch from './ThemeSwitch';
import { HeaderProps, TabProps } from './Header';
import { login } from '../../../state/reducers/user';
import { useDispatch } from 'react-redux';
import AccountMenu from './AccountMenu';

const devMode = process.env.NODE_ENV === 'development';

const DefaultHeader: React.FC<HeaderProps> = ({
    classes,
    pages,
    handleNavigation,
    handleLogin
}) => {
    const dispatch = useDispatch<AppDispatch>();

    const user: User | undefined = useSelector((state: RootState) => state.user.user);
    const userFetchState: apiState = useSelector((state: RootState) => state.user.userFetchState);

    return (
        <>
            <AppBar className="spl-header" position="static">
                <Toolbar className='spl-toolbar'>
                    <div className='header-content'>
                        <div className='logo'>
                            <Link to="/">
                                <img className='logo-img' src='/img/logo.png' alt="Save Point Lodge" />
                            </Link>
                        </div>
                        <div className='nav-tabs-container'>
                            <div className='nav-tabs'>
                                {pages.map((page) => (
                                    <Button
                                        sx={page.isLogo ? { my: 2, alignSelf: 'flex-start' } : {}}
                                        name={page.name}
                                        key={page.key}
                                        onClick={handleNavigation}
                                        // sx={{ my: 2, color: 'white', display: 'block' }}
                                        disableFocusRipple={true}
                                        disableRipple={true}
                                        startIcon={page.icon && page.external ? page.icon : undefined}
                                    >
                                        {page.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className='personalization'>
                            <div className='theme-toggle'><ThemeSwitch /></div>
                            {user !== null && <AccountMenu />}
                            {user === null && (
                                <div className='acct'>
                                    <Button
                                        variant="contained"
                                        onClick={handleLogin}
                                        startIcon={<AccountCircle />}
                                        loading={userFetchState === 'pending'}
                                    >Login</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
        </>
    );
};

export default DefaultHeader;