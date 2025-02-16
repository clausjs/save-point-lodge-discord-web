import React, { useState, useEffect } from 'react';
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
    PageLink,
    User
} from '../../../types';

import '../../../sass/_globals.scss';
import ThemeSwitch from './ThemeSwitch';

import { AllPages as views } from './Views';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../../../state/reducers/user';
import { HeaderProps } from './Header';

interface TabProps {
    key: number;
    name: string;
    label: React.ReactNode | string;
    href: string;
    disabled?: boolean;
    icon?: JSX.Element;
    external?: boolean;
    requiresAuth?: boolean;
    requiresSoundboarder?: boolean;
    isLogo?: boolean;
}

const DefaultHeader: React.FC<HeaderProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [ tabs, setTabs ] = useState<TabProps[]>([]);
    const [ authAnchorEl, setAuthAnchorEl ] = useState<Element | (() => Element)>(null);
    const history = useNavigate();
    const authMenuOpen: boolean = Boolean(authAnchorEl);

    const user: User = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
        }
    }, []);

    useEffect(() => {
        const _tabs = [];
        for (let i = 0; i < Object.keys(views).length; i++) {
            const viewName = Object.keys(views)[i];
            const page: PageLink = views[viewName];
            if (page.requiresAuth && user === null) {
                continue;
            }

            let label: React.ReactNode | string;
            label = page.label ? page.label : viewName;

            const { isLogo } = page;

            const props: TabProps = {
                name: viewName,
                key: i,
                label,
                href: page.to,
                disabled: page.disabled,
                icon: page.externalSite ? <Launch /> : undefined,
                external: page.externalSite || false,
                isLogo
            };
            
            _tabs.push(props);
        }
        setTabs(_tabs);
    }, [user]);

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    const handleNavigation = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const linkName: string = (event.target as HTMLButtonElement).name;

        if (linkName) {
            const view = tabs.find(tab => tab.name === linkName);
            if (view) {
                if (view.external) {
                    window.open(view.href, "_blank");
                } else {
                    // setView(tabs.findIndex(tab => tab.name === linkName));
                    history(view.href);
                }
            }
        }
    }

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
                                {tabs.map((page) => (
                                    <Button
                                        sx={page.isLogo ? { my: 2, alignSelf: 'flex-start' } : {}}
                                        name={page.name}
                                        key={page.key}
                                        onClick={handleNavigation}
                                        // sx={{ my: 2, color: 'white', display: 'block' }}
                                        disableFocusRipple={true}
                                        disableRipple={true}
                                        startIcon={page.icon ? page.icon : undefined}
                                    >
                                        {page.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className='personalization'>
                            <div className='theme-toggle'><ThemeSwitch /></div>
                            {user !== null && (
                                <div className='acct'>
                                    <IconButton
                                        aria-label={`${user.username}'s Account`}
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={handleAuthMenu}
                                    >
                                        {/* {userState.status === 'loading' && <MoonLoader size={20} />} */}
                                        {user && user.avatar && <img className='acct-icon' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`} />}
                                        {user && user.avatar === null && <AccountCircle />}
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
                                        {user && user.isPlanetExpressMember === true && (
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
                    </div>
                </Toolbar>
            </AppBar>
        </>
    );
};

const LinkTab = (props: any) => {
    return (
        <Tab
            component="a"
            onClick={(e: any) => { if (!props.external) e.preventDefault(); }}
            target={props.external ? "_blank" : undefined}
            {...props}
        />
    )
};

export default DefaultHeader;