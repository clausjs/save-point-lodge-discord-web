import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button, Grid, Input } from '@mui/material';

import AddClipDialog from './AddClipDialog';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { Clip, User } from '../../types';
import SoundboardClip from './SoundbardClip';
import toastr from '../../utils/toastr';

import { Search } from '@mui/icons-material';
import { fetchSoundboardClips, addClip } from '../../state/reducers/soundboard';

import './Soundboard.scss';

const Soundboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    //Public API that will echo messages sent to it back to the client
    const [ socketUrl ] = useState('ws://localhost:8080/soundboard');
    const [ hasBeenConnected, setHasBeenConnected ] = useState<boolean>(false);
    const [ messageHistory, setMessageHistory ] = useState<MessageEvent<{ type: string, sound?: string }>[]>([]);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ dialogOpen, setDialogOpen ] = useState(false);

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const user: User = useSelector((state: RootState) => state.user.user);
    const clips: Clip[] = useSelector((state: RootState) => state.soundboard.clips);
    console.log("clips", clips);

    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl, { shouldReconnect: (closeEvent) => true });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
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
        switch (readyState) {
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
            sendJsonMessage({ type: 'play_sound', sound: clip.url });
        }
    };

    useEffect(() => {
        if (!clips.length) {
            dispatch(fetchSoundboardClips());
        }
    }, []);

    const _addClip = (clip: Clip) => {
        // props.addClip(clip);
        dispatch(addClip(clip))
    }

    const favoriteClip = (clipId: string) => {}

    const filteredClips = searchTerm === "" ? clips : clips.filter(clip =>
        clip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.tags.map(t => t.toLowerCase()).includes(searchTerm.toLowerCase()) ||
        clip.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='soundboard'>
            <AddClipDialog open={dialogOpen} onClose={closeDialog} onSave={addClip} />
            <div className='grid-actions'>
                <p className='status'>Connection status: <span className={getConnectionStatusClass()}>{connectionStatus}</span></p>
                <div className='button-grp'>
                    <Button variant="contained" color="primary" onClick={openDialog}>Add Clip</Button>
                    <Button variant="contained">Play Random Sound</Button>
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
            <Grid className='soundboard-items' container spacing={2} style={{ marginTop: 20 }}>
                {filteredClips.map((clip, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index} onClick={() => playClip(clip.id)}>
                        <SoundboardClip 
                            {...clip}
                            isFavorite={clip.favoritedBy?.includes(user?.id)} 
                            onClick={playClip} 
                            onFavorite={favoriteClip}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default Soundboard;