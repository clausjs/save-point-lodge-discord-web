import React, { useEffect } from 'react';

import { useMediaQuery } from '@mui/material';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import { ClassNameMap, makeStyles } from '@mui/styles';
import { AppDispatch, RootState } from '../../../state/store';
import { useSelector } from 'react-redux';
import { User } from '../../../types';
import { useDispatch } from 'react-redux';
import { fetchPlanetExpressStatus, fetchSoundboarderStatus, fetchUser } from '../../../state/reducers/user';

export interface HeaderProps {
    classes: ClassNameMap;
}

const useStyles = makeStyles((theme: any) => ({
    root: {
        display: 'flex',
        flexGrow: 0,
    }
}));

const Header: React.FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch<AppDispatch>()
    const isMobile: boolean = useMediaQuery('(max-width: 1100px)', { noSsr: true });

    const user: User | undefined = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
            dispatch(fetchPlanetExpressStatus());
            dispatch(fetchSoundboarderStatus());
        }
    }, []);

    return (
        <div className={classes.root}>
            {isMobile ? <MobileHeader classes={classes} /> : <DesktopHeader classes={classes} />}
        </div>
    );
}

export default Header;