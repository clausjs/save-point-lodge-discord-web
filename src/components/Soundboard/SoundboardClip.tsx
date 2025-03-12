import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Paper, Stack, Typography, Grid2 as Grid, SpeedDial, SpeedDialAction, Slider } from "@mui/material";
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow, Save, Speaker, Stop, VolumeDown, VolumeUp } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Clip, User } from '../../types';
import { AppDispatch, RootState } from '../../state/store';

import ClipActionButton from './ClipActionButton';
import { DialogClip } from './Soundboard';
import MobileClipActionMenu from './MobileActionMenu';

enum ACTION_BUTTON_SECTIONS {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

const SoundboardClip: React.FC<Clip & { 
    isMyInstant?: boolean,
    onClick: (clipId: string) => void, 
    onFavorite: (clipId: string) => void 
    onEdit: (clip: DialogClip) => void
    onDelete: (clip: DialogClip) => void
}> = ({
    id,
    name, 
    tags,
    description,
    uploadedBy,
    url,
    volume = 50,
    favoritedBy,
    onClick,
    onFavorite,
    onEdit,
    onDelete,
    isMyInstant = false
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();
    const useMenuBasedButtons = useMediaQuery('(min-width:600px)', { noSsr: true });
    const newUseMediaQuery = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

    const audioFile = useRef(null);
    const [ expanded, setExpanded ] = useState(false);
    const [ showMenu, setShowMenu ] = useState(false);
    const [ showVolumeSlider, setShowVolumeSlider ] = useState<boolean>(false);
    const [ previewVolume, setPreviewVolume ] = useState<number>(volume);

    const user: User | undefined = useSelector((state: RootState) => state.user.user);
    const username: string = user.username;
    const isFavorite: boolean = favoritedBy?.includes(user?.id)

    const controlAudio = (e: React.MouseEvent<any, MouseEvent>, action: 'play' | 'stop' | 'volume') => {
        e.stopPropagation();
        switch (action) {
            case 'play':
                audioFile.current.currentTime = 0;
                audioFile.current.play();
                audioFile.current.volume = previewVolume / 100;
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
            audioFile.current.volume = previewVolume / 100;
        }
    }, [previewVolume])

    const getActionButtonSection = (section: ACTION_BUTTON_SECTIONS): React.ReactNode => {
        switch (section) {
            case ACTION_BUTTON_SECTIONS.TOP:
                return (
                    <React.Fragment>
                        <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />
                        <ClipActionButton disabled={isMyInstant} classes={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} title='favorite' Icon={Favorite} />
                    </React.Fragment>
                );
            case ACTION_BUTTON_SECTIONS.MIDDLE:
                if (newUseMediaQuery) {
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

    // const _addClip = (e: React.MouseEvent<any, any>) => {
    //     e.stopPropagation();
    //     dispatch(addClip({ id, name, tags, description, url, volume: previewVolume, uploadedBy: username }));
    // }
    const _addMyInstant = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onEdit({ id, name, tags, description, url, volume: previewVolume, uploadedBy: username, isSavingMyInstant: true });
    }

    const getClipActions = (): React.ReactNode[] => {
        if (isMyInstant) {
            return [
                <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />,
                <ClipActionButton onClick={(e) => controlAudio(e, 'stop')} title='stop' Icon={Stop} />,
                <ClipActionButton onClick={_addMyInstant} title='save' Icon={Save} />
            ];
        } else if (!useMenuBasedButtons) {
            return [
                getActionButtonSection(ACTION_BUTTON_SECTIONS.TOP),
                getActionButtonSection(ACTION_BUTTON_SECTIONS.BOTTOM)
            ];
        } else {
            return [
                getActionButtonSection(ACTION_BUTTON_SECTIONS.MIDDLE)
            ]
        }
    }

    const onAction = (action: Function) => {
        setShowMenu(false);
        action({ id, name, tags, description, url, volume, uploadedBy, favoritedBy });
    }

    const _onFavorite = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        setShowMenu(false);
        onFavorite(id);
    }

    const _onEdit = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        setShowMenu(false);
        onEdit({ id, name, tags, description, url, volume, uploadedBy, favoritedBy });
    }

    const _onDelete = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        setShowMenu(false);
        onDelete({ id, name, tags, description, url, volume, uploadedBy, favoritedBy });
    }

    return (
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`.trim()} style={{ padding: 10 }} onClick={() => onAction(onClick)} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1" title={name}>{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${expanded ? 'show' : ''}`.trim()} variant="body2">{description}</Typography>
            {newUseMediaQuery && <div className={`mobile-actions ${showMenu ? 'show' : 'hide'}`.trim()}>
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
            <Box className='clip-footer' sx={{ width: '100%' }}>
                <Box className='tags'>
                    {!isMyInstant && tags.length > 0 && <>
                        {tags.map((tag, index) => (
                            <Chip
                                className='clip-tag'
                                key={index}
                                label={tag}
                                sx={{ margin: '2px' }}
                                title={tag}
                            />
                        ))}
                    </>}
                </Box>
                <Stack className='clip-actions' spacing={{ sm: 0.5, md: 1 }} direction='row'>
                    {!isMyInstant && !newUseMediaQuery && <>
                        <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />
                        <ClipActionButton classes={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} title='favorite' Icon={Favorite} />
                        <ClipActionButton onClick={_onEdit} title='edit' Icon={Edit} />
                        <ClipActionButton disabled={isMyInstant || uploadedBy !== username} onClick={_onDelete} title='delete' Icon={Delete} />
                    </>}
                    {!isMyInstant && newUseMediaQuery && <MobileClipActionMenu 
                        onPlay={(e) => controlAudio(e, 'play')}
                        onFavorite={_onFavorite}
                        onEdit={_onEdit}
                        onDelete={_onDelete}
                    />}
                    {isMyInstant && <>
                        <ClipActionButton onClick={(e) => controlAudio(e, 'play')} title='play' Icon={PlayArrow} />
                        <ClipActionButton onClick={(e) => controlAudio(e, 'stop')} title='stop' Icon={Stop} />
                        <ClipActionButton onClick={_addMyInstant} title='save' Icon={Save} />
                    </>}
                </Stack>
            </Box> 
            {isMyInstant && <div className={`volume-controls ${showVolumeSlider ? 'show' : 'hide'}`.trim()} onMouseLeave={(e) => setShowVolumeSlider(false)}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                    <VolumeDown />
                        <Slider aria-label="Volume" value={previewVolume} onChange={(e, newValue) => setPreviewVolume(newValue as number)} />
                    <VolumeUp />
                </Stack>    
            </div>}
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

export default SoundboardClip;