import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Paper, Stack, Typography, Grid2 as Grid, SpeedDial, SpeedDialAction, Slider } from "@mui/material";
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow, Save, Speaker, Stop, VolumeDown, VolumeUp } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Clip, User } from '../../types';
import { AppDispatch, RootState } from '../../state/store';

import ClipActionButton, { ClipPreviewButton } from './ClipActionButton';
import { DialogClip } from './Soundboard';
import MobileClipActionMenu from './MobileActionMenu';

enum ACTION_BUTTON_SECTIONS {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

const SoundboardClip: React.FC<Clip & { 
    isMyInstant?: boolean,
    filterByTag: (tag: string) => void,
    onClick: (clipId: string, volumeOverride?: number) => void, 
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
    filterByTag,
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
    const [ isPlaying, setIsPlaying ] = useState<boolean>(false);
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
                setIsPlaying(true);
                break;
            case 'stop':
                audioFile.current.pause();
                setIsPlaying(false);
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

    const _addMyInstant = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onEdit({ id, name, tags, description, url, volume: previewVolume, uploadedBy: username, isSavingMyInstant: true });
    }

    const _onPlay = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        setShowMenu(false);
        if (isMyInstant) onClick(id, previewVolume);
        else onClick(id);
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
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`.trim()} style={{ padding: 10 }} onClick={_onPlay} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1" title={name}>{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${expanded ? 'show' : ''}`.trim()} variant="body2">{description}</Typography>
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
                                onClick={(e: React.MouseEvent<any, any>) => {
                                    e.stopPropagation();
                                    filterByTag(tag);
                                }}
                            />
                        ))}
                    </>}
                    {isMyInstant && <ClipActionButton onMouseOver={(e) => controlAudio(e, 'volume')} onClick={(e) => controlAudio(e, 'volume')} title='volume' Icon={VolumeUp} />}
                </Box>
                <Stack className='clip-actions' spacing={{ sm: 0.5, md: 1 }} direction='row'>
                    {!isMyInstant && !newUseMediaQuery && <>
                        <ClipPreviewButton play={(e) => controlAudio(e, 'play')} stop={(e) => controlAudio(e, 'stop')} isPlaying={isPlaying} />
                        <ClipActionButton classes={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} title='favorite' Icon={Favorite} />
                        <ClipActionButton onClick={_onEdit} title='edit' Icon={Edit} />
                        <ClipActionButton disabled={isMyInstant || uploadedBy !== username} onClick={_onDelete} title='delete' Icon={Delete} />
                    </>}
                    {!isMyInstant && newUseMediaQuery && <MobileClipActionMenu
                        isFavorite={isFavorite}
                        isPlaying={isPlaying} 
                        onPlay={(e) => controlAudio(e, isPlaying ? 'stop' : 'play')}
                        onFavorite={_onFavorite}
                        onEdit={_onEdit}
                        onDelete={_onDelete}
                    />}
                    {isMyInstant && <>
                        <ClipPreviewButton play={(e) => controlAudio(e, 'play')} stop={(e) => controlAudio(e, 'stop')} isPlaying={isPlaying} />
                        <ClipActionButton onClick={_addMyInstant} title='save' Icon={Save} />
                    </>}
                </Stack>
            </Box> 
            {isMyInstant && <div className={`volume-controls ${showVolumeSlider ? 'show' : 'hide'}`.trim()} onMouseLeave={(e) => setShowVolumeSlider(false)}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <VolumeDown />
                        <Slider aria-label="Volume" value={previewVolume} onChange={(e, newValue) => {
                            e.stopImmediatePropagation();
                            setPreviewVolume(newValue as number);
                        }} />
                    <VolumeUp />
                </Stack>    
            </div>}
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

export default SoundboardClip;