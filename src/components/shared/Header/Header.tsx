import React, { useEffect, useState } from 'react';

import { IconButton, ListItem, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import { ClassNameMap, makeStyles } from '@mui/styles';
import { AppDispatch, RootState } from '../../../state/store';
import { useSelector } from 'react-redux';
import { PageLink, User } from '../../../types';
import { useDispatch } from 'react-redux';
import { fetchPlanetExpressStatus, fetchSoundboarderStatus, fetchUser } from '../../../state/reducers/user';
import { AccountCircle, Launch } from '@mui/icons-material';
import { AllPages as views } from './Views';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';

export interface HeaderProps {
    classes?: ClassNameMap;
    pages: TabProps[];
    handleNavigation: (event: React.MouseEvent<any, any>) => void;
}

const useStyles = makeStyles((theme: any) => ({
    root: {
        display: 'flex',
        flexGrow: 0,
    }
}));

export interface TabProps {
    key: number;
    name: string;
    label: React.ReactNode | string;
    href: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    external?: boolean;
    requiresAuth?: boolean;
    requiresSoundboarder?: boolean;
    isLogo?: boolean;
}

const devMode = process.env.NODE_ENV === 'development';

const Header: React.FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch<AppDispatch>();
    const currentLocation = useLocation();
    const history = useNavigate();
    const isMobile: boolean = useMediaQuery('(max-width: 1100px)', { noSsr: true });
    const [ pages, setPages ] = useState<TabProps[]>([]);

    const user: User | undefined = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
            dispatch(fetchSoundboarderStatus());
            dispatch(fetchPlanetExpressStatus());
        }
    }, []);

    useEffect(() => {
        const _tabs: TabProps[] = [];
        for (let i = 0; i < Object.keys(views).length; i++) {
            const viewName = Object.keys(views)[i];
            const page: PageLink = views[viewName];
            if (page.requiresAuth && !user) continue;
            if (page.requiresSoundboarder && !user?.isSoundboardUser) continue;

            let label: React.ReactNode | string;
            label = page.label ? page.label : viewName;

            const { isLogo } = page;

            const props: TabProps = {
                name: viewName,
                key: i,
                label,
                href: page.to,
                disabled: page.disabled,
                icon: page.externalSite ? <Launch /> : page.icon,
                external: page.externalSite || false,
                isLogo
            };
            
            _tabs.push(props);
        }
        setPages(_tabs);
    }, [user]);

    const handleNavigation = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const linkName: string = (event.target as HTMLButtonElement).name;

        if (linkName) {
            const view = pages.find(page => page.name === linkName);
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

    if (currentLocation.pathname === '/postAuth') return null;

    return (
         <div className={classes.root}>
             {isMobile ? <MobileHeader classes={classes} pages={pages} handleNavigation={handleNavigation}/> : <DesktopHeader classes={classes} pages={pages} handleNavigation={handleNavigation}/>}
        </div>
    );
}

export default Header;