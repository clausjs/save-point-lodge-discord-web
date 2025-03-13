import React, { useState } from 'react';
import { Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Delete, Edit, Favorite, MoreHoriz, PlayArrow } from '@mui/icons-material';
import ClipActionButton from './ClipActionButton';

export interface MobileClipActionMenuProps {
    isFavorite?: boolean,
    onPlay: (e: React.MouseEvent<any, any>) => void;
    onFavorite: (e: React.MouseEvent<any, any>) => void;
    onEdit: (e: React.MouseEvent<any, any>) => void;
    onDelete: (e: React.MouseEvent<any, any>) => void;
}

const MobileClipActionMenu: React.FC<MobileClipActionMenuProps> = ({
    isFavorite = false,
    onPlay,
    onFavorite,
    onEdit,
    onDelete
}) => {
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const _onPlay = (e: React.MouseEvent<any, any>) => {
        setAnchorEl(null);
        onPlay(e);
    }

    const _onFavorite = (e: React.MouseEvent<any, any>) => {
        setAnchorEl(null);
        onFavorite(e);
    }

    const _onEdit = (e: React.MouseEvent<any, any>) => {
        setAnchorEl(null);
        onEdit(e);
    }

    const _onDelete = (e: React.MouseEvent<any, any>) => {
        setAnchorEl(null);
        onDelete(e);
    }

    return (
        <div>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'inherit' }}>
                <MoreHoriz />
            </IconButton>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={(e) => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem><ClipActionButton onClick={_onPlay} title='play' Icon={PlayArrow} /></MenuItem>
                <MenuItem><ClipActionButton classes={isFavorite ? 'favorited' : ''} onClick={_onFavorite} title='favorite' Icon={Favorite} /></MenuItem>
                <MenuItem><ClipActionButton onClick={_onEdit} title='edit' Icon={Edit} /></MenuItem>
                <MenuItem><ClipActionButton onClick={_onDelete} title='delete' Icon={Delete} /></MenuItem>
            </Menu>
        </div>

    )
}

export default MobileClipActionMenu;