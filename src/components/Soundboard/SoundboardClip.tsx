import React, { useEffect, useRef, useState } from 'react';
import { Chip, IconButton, Paper, Slider, Stack, Typography, useMediaQuery } from "@mui/material";
import { Clip, User } from '../../types';
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow, Save, Speaker, Stop, VolumeDown, VolumeUp } from '@mui/icons-material';
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
    const [ showVolumeSlider, setShowVolumeSlider ] = useState<boolean>(false);
    const [ volume, setVolume ] = useState<number>(50);

    const username: string = useSelector((state: RootState) => state.user.user.username);

    const controlAudio = (e: React.MouseEvent<SVGSVGElement, MouseEvent>, action: 'play' | 'stop' | 'volume') => {
        e.stopPropagation();
        switch (action) {
            case 'play':
                audioFile.current.currentTime = 0;
                audioFile.current.play();
                audioFile.current.volume = volume / 100;
                break;
            case 'stop':
                audioFile.current.pause();
                break;
            case 'volume':
                setShowVolumeSlider(!showVolumeSlider);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (audioFile.current) {
            audioFile.current.volume = volume / 100;
        }
    }, [volume])

    const getActionButtonSection = (section: ACTION_BUTTON_SECTIONS) => {
        switch (section) {
            case ACTION_BUTTON_SECTIONS.TOP:
                return (
                    <React.Fragment>
                        <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />
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

    const _addClip = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        dispatch(addClip({ id, name, tags, description, url, uploadedBy: username }));
    }

    const getClipActions = () => {
        if (isMyInstant) {
            return (
                <React.Fragment>
                    <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />
                    <ClipActionButton onClick={(e) => controlAudio(e, 'stop')} title='stop' Icon={Stop} />
                    <ClipActionButton onClick={_addClip} title='save' Icon={Save} />
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
                {!isMyInstant && <div className='tags'>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            style={{ margin: '2px' }}
                            title={tag}
                        />
                    ))}
                </div>}
                {isMyInstant && <ClipActionButton onMouseOver={(e) => controlAudio(e, 'volume')} onClick={(e) => controlAudio(e, 'volume')} title='volume' Icon={VolumeUp} />}
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
                {isMyInstant && <div className={`volume-controls ${showVolumeSlider ? 'show' : 'hide'}`.trim()} onMouseLeave={(e) => setShowVolumeSlider(false)}>
                    <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                        <VolumeDown />
                            <Slider aria-label="Volume" value={volume} onChange={(e, newValue) => setVolume(newValue as number)} onChangeCommitted={() => setShowVolumeSlider(false)} />
                        <VolumeUp />
                    </Stack>    
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
    onMouseOver?: (e: React.MouseEvent<any, any>) => void;
    classes?: string;
    disabled?: boolean;
}

const ClipActionButton: React.FC<ClipActionButtonProps> = ({ classes, onMouseOver, onClick, title, Icon, disabled }) => {
    return (
        <IconButton onMouseOver={onMouseOver} className={`clip-action-button ${classes ?? ''}`} onClick={onClick} title={title} aria-label={title} disabled={disabled}>
            <Icon />
        </IconButton>
    );
}

export default SoundboardClip;