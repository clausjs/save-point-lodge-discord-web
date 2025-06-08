import React, { useEffect, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';

import './SPLMenu.scss';

export interface SPLMenuItem {
    node: React.ReactNode;
    onClick?: (args: any) => void;
    disabled?: boolean;
    keepOpen?: boolean;
}

interface SPLMenuProps {
    classes?: string;
    items: (React.ReactNode | SPLMenuItem)[];
}

interface UncontrolledSPLMenu extends SPLMenuProps {
    trigger?: React.ReactNode;
}

interface ControlledSPLMenu extends SPLMenuProps {
    anchorEl: null | HTMLElement;
    onClose?: () => void;
}

const SPLMenu: React.FC<UncontrolledSPLMenu | ControlledSPLMenu> = ({
    classes = "",
    //@ts-expect-error
    trigger = null,
    //@ts-expect-error
    anchorEl = null,
    //@ts-expect-error
    onClose = () => {},
    items = []
}) => {
    const [ _anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);

    useEffect(() => {
        setAnchorEl(anchorEl);
    }, [anchorEl]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <>  
            {trigger && <div onClick={handleMenuOpen}>{trigger}</div>}
            <Menu
                className={`spl-menu ${classes}`}
                anchorEl={_anchorEl}
                open={Boolean(_anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    onClose();
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ className: '' }}
                slotProps={{
                    paper: {
                        className: 'spl-menu-container'
                    }
                }}
            >
                {items.map((item, index) => (
                    <MenuItem
                        key={index}
                        className='menu-item'
                        onClick={React.isValidElement(item) ? () => {} : (e) => {
                            item = item as SPLMenuItem;
                            if (!item.keepOpen) setAnchorEl(null);
                            (item as SPLMenuItem).onClick(e);
                        }}
                    >
                        {React.isValidElement(item) ? item : (item as SPLMenuItem).node}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default SPLMenu;