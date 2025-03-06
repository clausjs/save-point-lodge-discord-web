import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button, FormControl, Grid, Input, InputLabel, MenuItem, Select } from '@mui/material';
import { GridLoader } from 'react-spinners';

import ConfigClipDialog from './ConfigClipDialog';
import DeleteClipDialog from './DeleteClipDialog';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { Clip, User } from '../../types';
import SoundboardClip from './SoundboardClip';
import toastr from '../../utils/toastr';

import { Search } from '@mui/icons-material';
import { fetchSoundboardClips, addClip, editClip, deleteClip } from '../../state/reducers/soundboard';

import './Soundboard.scss';

enum SortType {
    DEFAULT = "Default",
    TITLE_ASC = "Title (Ascending)",
    TITLE_DEC = "Title (Descending)",
    CREATED_ASC = "Created (Ascending)",
    CREATED_DEC = "Created (Descending)",
    UPLOADER_ASC = "Uploader (Ascending)",
    UPLOADER_DEC = "Uploader (Descending)",
}

const devMode = process.env.NODE_ENV === 'development' ? true : false;

const Soundboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    //Public API that will echo messages sent to it back to the client
    const [ socketUrl, setSocketUrl ] = useState<string | null>(null);
    const [ hasBeenConnected, setHasBeenConnected ] = useState<boolean>(false);
    const [ messageHistory, setMessageHistory ] = useState<MessageEvent<{ type: string, sound?: string }>[]>([]);
    const [ fetchingClips, setFetchingClips ] = useState<boolean>(false);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ editingClip, setEditingClip ] = useState<Clip | null>(null);
    const [ deletingClip, setDeletingClip ] = useState<Clip | null>(null);
    const [ sortType, setSortType ] = useState<SortType>(SortType.DEFAULT);

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => {
        setDeletingClip(null);
        setEditingClip(null);
        setDialogOpen(false);
    }

    const lightMode: boolean = useSelector((state: RootState) => state.theme.lightMode);
    const user: User = useSelector((state: RootState) => state.user.user);
    const clips: Clip[] = useSelector((state: RootState) => state.soundboard.clips);

    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl, { shouldReconnect: (closeEvent) => true });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const getConnectionStatusClass = () => {
        switch (readyState) {
            case ReadyState.CONNECTING:
                return 'unknown';
            case ReadyState.OPEN:
                return 'success';
            case ReadyState.CLOSING:
                return 'error';
            case ReadyState.CLOSED:
                return 'error';
            default:
                return '';
        }
    }

    useEffect(() => {
        if (!user) return;
        if (!user.isSoundboardUser) return;
        if (!clips.length) {
            setFetchingClips(true);
            dispatch(fetchSoundboardClips());
        }
    }, []);

    useEffect(() => {
        if (user && user.isSoundboardUser) {
            if (clips.length) setFetchingClips(false);
            if (devMode) {
                setSocketUrl('ws://localhost:8080/soundboard/');
            } else {
                setSocketUrl('wss://joebotdiscord.com/soundboard/');
            }
        }
    }, [clips]);

    useEffect(() => {
        switch (readyState) {
            case ReadyState.UNINSTANTIATED:
                break;
            case ReadyState.CONNECTING:
                toastr.info('Connecting to Joe_Bot...');
                break;
            case ReadyState.OPEN:
                toastr.success('Connected to Joe_Bot');
                setHasBeenConnected(true);
                break;
            case ReadyState.CLOSED:
                if (hasBeenConnected) toastr.info('Connection to Joe_Bot lost. Attempting to reconnect...');
                break;
            default:
                console.error('WebSocket is in an unknown state:', readyState);
                if (hasBeenConnected) toastr.error("Can't establish connection to Joe_Bot");
        }
    }, [readyState]);

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
    }, [lastMessage]);

    const playClip = (clipId: string) => {
        const clip: Clip | undefined = clips.find(c => {
            return c.id === clipId
        });
        if (clip && clip.url && readyState === ReadyState.OPEN) {
            sendJsonMessage({ type: 'play_sound', sound: clip.url, caller: user.id });
        }
    };

    const _addOrEditClip = (clip: Clip) => {
        if (editingClip) {
            dispatch(editClip(clip));
        } else {
            dispatch(addClip({ ...clip, uploadedBy: user?.username }));
        }
    }

    const _deleteClip = (clipId: string) => {
        setDeletingClip(clips.find(c => c.id === clipId) || null);
    }

    const playRandomClip = () => {
        const randomIndex = Math.floor(Math.random() * clips.length);
        playClip(clips[randomIndex].id);
    }

    const favoriteClip = (clipId: string) => {}

    const openClipEdit = (clipId: string) => {
        const clip: Clip | undefined = clips.find(c => {
            return c.id === clipId
        });
        if (clip) {
            setEditingClip(clip);
            openDialog();
        }
    }

    const filteredClips = Array.from(clips).sort((a: Clip, b: Clip) => {
        console.log("Sort type:", sortType, a, b);
        switch (sortType) {
            case SortType.TITLE_ASC:
                return a.name.localeCompare(b.name);
            case SortType.TITLE_DEC:
                return b.name.localeCompare(a.name);
            case SortType.CREATED_ASC:
                return new Date(a.createdAt)?.getTime() - new Date(b.createdAt)?.getTime();
            case SortType.CREATED_DEC:
                return new Date(b.createdAt)?.getTime() - new Date(a.createdAt)?.getTime();
            case SortType.UPLOADER_ASC:
                return a.uploadedBy.localeCompare(b.uploadedBy);
            case SortType.UPLOADER_DEC:
                return b.uploadedBy.localeCompare(a.uploadedBy);
            default:
                return a.id.localeCompare(b.id);
        }
    }).filter(clip => {
        if (!searchTerm) return true;
        return (clip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clip.tags.map(t => t.toLowerCase()).includes(searchTerm.toLowerCase()) ||
                clip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <>
            {!user || !user.isSoundboardUser ? <div className='no-soundboard-access'>You must have the correct role access to access this page. If you feel this is incorrect, contact an admin.</div> : null}
            {user && user.isSoundboardUser && <div className='soundboard'>
                <DeleteClipDialog clip={deletingClip} open={deletingClip !== null} onClose={closeDialog} onDelete={() => { dispatch(deleteClip(deletingClip)); }} />
                <ConfigClipDialog clip={editingClip} open={dialogOpen} onClose={closeDialog} onSave={_addOrEditClip} />
                <div className='grid-actions'>
                    <p className='status'>Connection status: <span className={getConnectionStatusClass()}>{connectionStatus}</span></p>
                    {/* <div className='my-instants-button'>
                        <div className='circle small-button-background'></div>
                        <button onClick={() => console.log("Load my instants")} />
                    </div> */}
                    <div className='sort-control'>    
                        <FormControl variant="standard" fullWidth>
                            <InputLabel id='sort-label' sx={{ color: 'inherit' }}>Sort by:</InputLabel>
                            <Select
                                labelId="sort-label"
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value as SortType)}
                                label="Sort by:"
                                sx={{ color: 'inherit' }}
                            >
                                {Object.values(SortType).map((sortType, i) => {
                                    return <MenuItem key={i} value={sortType}>{sortType}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='button-grp'>
                        <Button className='grid-action' variant="contained" onClick={openDialog}>Add Clip</Button>
                        <Button className='grid-action' variant="contained" onClick={playRandomClip}>Play Random Sound</Button>
                    </div>
                </div>
                <Input
                    name='clip-search'
                    className='search-bar'
                    placeholder="Search sounds..."
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
                    value={searchTerm}
                    endAdornment={<Search />}
                />
                {fetchingClips && <div className='loading'><GridLoader color={lightMode ? 'black' : 'white'} loading={fetchingClips} size={50} margin='auto' /></div>}
                {!fetchingClips && clips.length && <Grid className='soundboard-items' container spacing={2} style={{ marginTop: 20 }}>
                    {filteredClips.map((clip, index) => (
                        <Grid item xs={6} sm={4} md={2} key={index} onClick={() => playClip(clip.id)}>
                            <SoundboardClip 
                                {...clip}
                                isFavorite={clip.favoritedBy?.includes(user?.id)} 
                                onClick={playClip} 
                                onFavorite={favoriteClip}
                                onEdit={openClipEdit}
                                onDelete={_deleteClip}
                            />
                        </Grid>
                    ))}
                </Grid>}
            </div>}
        </>
    );
};

export default Soundboard;