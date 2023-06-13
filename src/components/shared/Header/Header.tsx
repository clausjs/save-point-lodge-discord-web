import React from 'react';

import { useMediaQuery } from '@material-ui/core';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import { HeaderProps } from '../../../types';

const Header: React.FC<HeaderProps> = (props) => {
    const isMobile: boolean = useMediaQuery('(max-width: 1100px)');

    return (
        <>
            {isMobile ? <MobileHeader {...props} /> : <DesktopHeader {...props} />}
        </>
    );
}

export default Header;