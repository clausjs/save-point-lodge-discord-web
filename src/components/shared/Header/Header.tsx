import React from 'react';

import { useMediaQuery } from '@mui/material';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import { ClassNameMap, makeStyles } from '@mui/styles';

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
    const isMobile: boolean = useMediaQuery('(max-width: 1100px)', { noSsr: true });

    return (
        <div className={classes.root}>
            {isMobile ? <MobileHeader classes={classes} /> : <DesktopHeader classes={classes} />}
        </div>
    );
}

export default Header;