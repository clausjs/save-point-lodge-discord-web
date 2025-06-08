import React from 'react';
import { IconButton } from "@mui/material";
import { PlayArrow, Stop } from '@mui/icons-material';

export interface ClipActionButtonProps {
    onClick?: (e: React.MouseEvent<any, any>) => void;
    title: string;
    Icon: React.ElementType;
    onMouseOver?: (e: React.MouseEvent<any, any>) => void;
    classes?: string;
    disabled?: boolean;
}

const ClipActionButton: React.FC<ClipActionButtonProps> = ({ classes, onMouseOver, onClick = () => {}, title, Icon, disabled = false }) => {
    return (
        <IconButton onMouseOver={onMouseOver} className={`clip-action-button ${classes ?? ''}`} onClick={onClick} title={title} aria-label={title} disabled={disabled} size='small' sx={{ color: 'inherit' }}>
            <Icon fontSize='inherit' />
        </IconButton>
    );
}

export default ClipActionButton;

export interface ClipPreviewButtonProps {
    play?: (e: React.MouseEvent<any, any>, volumeOverride?: number) => void;
    stop?: (e: React.MouseEvent<any, any>) => void;
    isPlaying: boolean;
}

export const ClipPreviewButton: React.FC<ClipPreviewButtonProps> = ({ play = () => {}, stop = () => {}, isPlaying }) => {
    return (
        <ClipActionButton
            onClick={isPlaying ? stop : play}
            title={isPlaying ? 'stop preview' : 'preview'}
            Icon={isPlaying ? Stop : PlayArrow}
        />
    );
}