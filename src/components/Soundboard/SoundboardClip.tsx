import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Paper, Stack, Typography, Grid2 as Grid, SpeedDial, SpeedDialAction, Slider, Menu, MenuItem, IconButton } from "@mui/material";
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow, Save, Speaker, Stop, VolumeDown, VolumeUp } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Clip, User } from '../../types';
import { AppDispatch, RootState } from '../../state/store';

import ClipActionButton, { ClipPreviewButton } from './Buttons/ClipActionButton';
import { DialogClip } from './Soundboard';
import { MyInstantType, SavedClipCategory } from './Menus/Categories';
import MobileClipActionMenu from './Menus/MobileActionMenu';
import { ScaleLoader } from 'react-spinners';
import { MyInstantsCategory } from './Menus/Categories';
import ClipActionMenu from './Menus/ClipActionMenu';

enum ACTION_BUTTON_SECTIONS {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

const SoundboardClip: React.FC<Clip & { 
    isMyInstant?: boolean,
    filterByTag: (tag: string) => void,
    filterByCategory: (category: SavedClipCategory | MyInstantType<MyInstantsCategory | undefined>) => void;
    onDurationLoaded: (clipId: string, duration: number) => void,
    onClick: (clipId: string, volumeOverride?: number) => void, 
    onFavorite: (clipId: string) => void 
    onEdit: (clip: DialogClip) => void
    onDelete: (clip: DialogClip) => void
}> = ({
    id,
    name, 
    tags,
    category,
    description,
    uploadedBy,
    url,
    volume = 50,
    favoritedBy,
    createdAt,
    updatedAt,
    filterByTag,
    filterByCategory,
    onDurationLoaded,
    onClick,
    onFavorite,
    onEdit,
    onDelete,
    isMyInstant = false
}) => {
    const theme = useTheme();
    const useMobileControls = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

    const audioFile = useRef(null);
    const [ expanded, setExpanded ] = useState(false);
    const [ isPlaying, setIsPlaying ] = useState<boolean>(false);
    const [ showVolumeSlider, setShowVolumeSlider ] = useState<boolean>(false);
    const [ previewVolume, setPreviewVolume ] = useState<number>(volume);

    const lightMode: boolean = useSelector((state: RootState) => state.theme.lightMode);
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

    useEffect(() => {
        
    }, [audioFile.current]);

    const _addMyInstant = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onEdit({ id, name, tags, description, url, volume: previewVolume, uploadedBy: username, isSavingMyInstant: true });
    }

    const _onPlay = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        if (isMyInstant) onClick(id, previewVolume);
        else onClick(id);
    }

    const _onFavorite = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onFavorite(id);
    }

    const _onEdit = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onEdit({ id, name, tags, category, description, url, volume, uploadedBy, favoritedBy, createdAt, updatedAt });
    }

    const _onDelete = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        onDelete({ id, name, tags, description, url, volume, uploadedBy, favoritedBy });
    }

    return (
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`.trim()} style={{ padding: 10 }} onClick={_onPlay} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Box className='clip-title-section'>
                <Typography className='clip-name' variant="body1" title={name}>{name}</Typography>
                <Box className={`clip-metadata ${expanded ? 'show' : ''}`.trim()}>
                    {category && <span className='clip-category' title={category ? category : 'Uncategorized'} onClick={(e) => {
                        e.stopPropagation();
                        filterByCategory(category);
                    }}><Typography variant='caption' className='category-text'>{category}</Typography></span>}
                    <Typography className='clip-duration' variant="caption">{audioFile.current?.duration ? `${audioFile.current?.duration.toFixed(2)}s` : <ScaleLoader loading={true} height={5} width={3} color={lightMode ? '' : '#B2B2B2'} />}</Typography>
                </Box>
            </Box>
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
                <ClipActionMenu
                    desktop={!useMobileControls}
                    play={(e) => controlAudio(e, 'play')}
                    stop={(e) => controlAudio(e, 'stop')}
                    onEdit={_onEdit}
                    onDelete={_onDelete}
                    onSave={_addMyInstant}
                    canDelete={!isMyInstant && uploadedBy === username}
                    isPlaying={isPlaying}
                    isFavorite={isFavorite}
                    isMyInstants={isMyInstant}
                    onFavorite={_onFavorite}
                />
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
            <audio preload='metadata' onLoadedMetadata={() => {
                if (audioFile.current) {
                    onDurationLoaded(id, audioFile.current.duration);
                }
            }} className='clip-audio' ref={audioFile} src={url} onEnded={() => {
                audioFile.current.pause();
                setIsPlaying(false);
            }} />
        </Paper>
    );
}

export default SoundboardClip;