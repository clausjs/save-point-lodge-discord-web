import React, { useEffect } from 'react';
import ClipActionButton, { ClipPreviewButton } from '../Buttons/ClipActionButton';
import { Delete, Edit, Favorite, MoreHoriz, Save } from '@mui/icons-material';
import { IconButton, Stack } from '@mui/material';
import SPLMenu, { SPLMenuItem } from '../../shared/Menu/SPLMenu';

interface ClipActionMenuProps {
    desktop?: boolean;
    play: (e: React.MouseEvent<any, any>) => void;
    stop: (e: React.MouseEvent<any, any>) => void;
    onEdit: (e: React.MouseEvent<any, any>) => void;
    onDelete: (e: React.MouseEvent<any, any>) => void;
    onSave?: (e: React.MouseEvent<any, any>) => void;
    canDelete?: boolean;
    isPlaying: boolean;
    isFavorite: boolean;
    isMyInstants?: boolean;
    onFavorite: (e: React.MouseEvent<any, any>) => void;
}

const ClipActionMenu: React.FC<ClipActionMenuProps> = ({ 
    desktop = false,
    play = (e) => {},
    stop = (e) => {},
    onEdit = (e) => {},
    onDelete = (e) => {},
    onSave = (e) => {},
    canDelete = false,
    isPlaying = false,
    isFavorite = false,
    isMyInstants = false,
    onFavorite = (e) => {}
}) => {
    const [ trigger, setTrigger ] = React.useState<React.ReactNode>();
    const [ items, setItems ] = React.useState<SPLMenuItem[]>();

    useEffect(() => {
        setTrigger(
            <IconButton size="small" sx={{ color: 'inherit' }} aria-label="more-actions">
                <MoreHoriz />
            </IconButton>
        );

        const _items: SPLMenuItem[] = [];
        if (!desktop) _items.push({ onClick: isPlaying ? stop : play, node: <ClipPreviewButton isPlaying={isPlaying} /> });
        const favoriteButton = <ClipActionButton classes={`${isFavorite ? 'favorited' : ''}`.trim()} title='favorite' Icon={Favorite} />;
        _items.push({ node: desktop ? <>{favoriteButton} Favorite</> : favoriteButton, onClick: onFavorite });
        const editButton = <Edit fontSize="small" sx={{ mr: 1 }} />;
        _items.push({ node: desktop ? <>{editButton} Edit</> : editButton, onClick: onEdit });
        const deleteButton = canDelete ? <Delete fontSize='small' sx={{ mr: 1 }} /> : null;
        if (deleteButton) _items.push({ node: desktop ? <>{deleteButton} Delete</> : deleteButton, onClick: onDelete });

        setItems(_items);
    }, [desktop, canDelete, isPlaying, isFavorite, isMyInstants])

    return (
        <Stack className='clip-actions' spacing={{ sm: 0.5, md: 1 }} direction='row'>
            {(desktop || isMyInstants) && <ClipPreviewButton play={play} stop={stop} isPlaying={isPlaying} />}
            {isMyInstants && <ClipActionButton onClick={onSave} title='save' Icon={Save} />}
            {!isMyInstants && <SPLMenu
                trigger={trigger}
                items={items}
            />}
        </Stack>
    );
};

export default ClipActionMenu;