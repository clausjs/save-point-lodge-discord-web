import { IconButton, Menu, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiState, User } from '../../../types';
import { RootState } from '../../../state/store';
import { AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AccountMenu: React.FC = () => {
    const [ authAnchorEl, setAuthAnchorEl ] = React.useState<Element | (() => Element)>(null);
    const [ accountIconUrl, setAccountIconUrl ] = useState<string | null>(null);
    const authMenuOpen: boolean = Boolean(authAnchorEl);

    const user: User | undefined = useSelector((state: RootState) => state.user.user);
    const userFetchState: apiState = useSelector((state: RootState) => state.user.userFetchState);

    const handleAuthMenu = (event: any) => {
        setAuthAnchorEl(event.currentTarget);
    }

    const handleAuthMenuClose = () => {
        setAuthAnchorEl(null)
    }

    useEffect(() => {
        if (userFetchState === 'fulfilled' && user) {
            if (user.avatarUrl) {
                setAccountIconUrl(user.avatarUrl);
            }
            else if (user.avatar) {
                setAccountIconUrl(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`);
            }
        }
    }, [user, userFetchState]);

    return (
        <div className='acct'>
            <IconButton
                aria-label={`${user.username}'s Account`}
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
                onClick={handleAuthMenu}
            >
                {/* {userState.status === 'loading' && <MoonLoader size={20} />} */}
                {user && (user.avatar || user.avatarUrl) && <img style={user.avatarUrl ? { height: '32px', width: '32px' } : {}} className='acct-icon' src={accountIconUrl} />}
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
                {user && user.isSoundboardUser === true && (
                    <MenuItem onClick={handleAuthMenuClose}><Link to="/streamdeck">Stream Deck Integration</Link></MenuItem>
                )}
                <MenuItem onClick={handleAuthMenuClose}><a href="/logout">Logout</a></MenuItem>
            </Menu>
        </div>
    );
}

export default AccountMenu;