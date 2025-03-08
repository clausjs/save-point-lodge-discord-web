import React, { useRef, useState } from 'react';
import { Chip, IconButton, Paper, Typography, useMediaQuery } from "@mui/material";
import { Clip, User } from '../../types';
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow, Save } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { useDispatch } from 'react-redux';
import { addClip } from '../../state/reducers/soundboard';

enum ACTION_BUTTON_SECTIONS {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

const SoundboardClip: React.FC<Clip & { 
    isFavorite?: boolean, 
    isMyInstant?: boolean,
    onClick: (clipId: string) => void, 
    onFavorite: (clipId: string) => void 
    onEdit: (clipId: string) => void
    onDelete: (clipId: string) => void
}> = ({
    id,
    name, 
    tags,
    description,
    uploadedBy,
    url,
    onClick,
    onFavorite,
    onEdit,
    onDelete,
    isFavorite = false,
    isMyInstant = false
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const useMenuBasedButtons = useMediaQuery('(max-width: 1350px)');
    const audioFile = useRef(null);
    const [ expanded, setExpanded ] = useState(false);
    const [ showMenu, setShowMenu ] = useState(false);

    const username: string = useSelector((state: RootState) => state.user.user.username);

    const playAudio = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        e.stopPropagation();
        audioFile.current.play();
    }

    const getActionButtonSection = (section: ACTION_BUTTON_SECTIONS) => {
        switch (section) {
            case ACTION_BUTTON_SECTIONS.TOP:
                return (
                    <React.Fragment>
                        <ClipActionButton onClick={playAudio} title='play' Icon={PlayArrow} />
                        <ClipActionButton disabled={isMyInstant} classes={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} title='favorite' Icon={Favorite} />
                    </React.Fragment>
                );
            case ACTION_BUTTON_SECTIONS.MIDDLE:
                if (useMenuBasedButtons) {
                    if (showMenu) {
                        return (
                            <ClipActionButton onClick={(e: React.MouseEvent<any, any>) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }} title='close' Icon={Close} />
                        );
                    } else {
                        return (
                            <ClipActionButton onClick={(e: React.MouseEvent<any, any>) => {
                                e.stopPropagation();
                                setShowMenu(true);
                            }} title='more' Icon={MoreHoriz} />
                        );
                    }
                }
            case ACTION_BUTTON_SECTIONS.BOTTOM:
                return (
                    <React.Fragment>
                        <ClipActionButton disabled={isMyInstant} onClick={_onEdit} title='more' Icon={Edit} />
                        <ClipActionButton disabled={isMyInstant || username !== uploadedBy} onClick={_onDelete} title='more' Icon={Delete} />
                    </React.Fragment>
                );
            default:
                return null;
        }
    }

    const getClipActions = () => {
        if (isMyInstant) {
            return (
                <React.Fragment>
                    <ClipActionButton onClick={playAudio} title='play' Icon={PlayArrow} />
                    <ClipActionButton onClick={() => dispatch(addClip({ id, name, tags, description, url, uploadedBy: username }))} title='save' Icon={Save} />
                </React.Fragment>
            );
        } else if (!useMenuBasedButtons) {
            return (
                <React.Fragment>
                    {getActionButtonSection(ACTION_BUTTON_SECTIONS.TOP)}
                    {getActionButtonSection(ACTION_BUTTON_SECTIONS.BOTTOM)}
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    {getActionButtonSection(ACTION_BUTTON_SECTIONS.MIDDLE)}
                </React.Fragment>
            )
        }
    }

    const onAction = (action: Function) => {
        setShowMenu(false);
        action(id);
    }

    const _onFavorite = () => {
        onFavorite(id);
    }

    const _onEdit = () => {
        onAction(onEdit);
    }

    const _onDelete = () => {
        onAction(onDelete);
    }

    return (
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`.trim()} style={{ padding: 10 }} onClick={() => onAction(onClick)} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1" title={name}>{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${expanded ? 'show' : ''}`.trim()} variant="body2">{description}</Typography>
            <div className='clip-footer'>
                <div className='tags'>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            style={{ margin: '2px' }}
                            title={tag}
                        />
                    ))}
                </div>
                <div className='actions'>
                    {getClipActions()}
                </div>
                {useMenuBasedButtons && <div className={`mobile-actions ${showMenu ? 'show' : 'hide'}`.trim()}>
                    <div className='buttons'>
                        <div>
                            {getActionButtonSection(ACTION_BUTTON_SECTIONS.TOP)}
                        </div>   
                        <div className='close'>
                            {getActionButtonSection(ACTION_BUTTON_SECTIONS.MIDDLE)}
                        </div>
                        <div>    
                            {getActionButtonSection(ACTION_BUTTON_SECTIONS.BOTTOM)}
                        </div>
                    </div>
                </div>}
            </div>
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

interface ClipActionButtonProps {
    onClick: (e: React.MouseEvent<any, any>) => void;
    title: string;
    Icon: React.ElementType;
    classes?: string;
    disabled?: boolean;
}

const ClipActionButton: React.FC<ClipActionButtonProps> = ({ classes, onClick, title, Icon, disabled }) => {
    return (
        <IconButton className={`clip-action-button ${classes ?? ''}`} onClick={onClick} title={title} aria-label={title} disabled={disabled}>
            <Icon />
        </IconButton>
    );
}

export default SoundboardClip;