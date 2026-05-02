import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';

import { AppDispatch, RootState } from '../../state/store';
import { apiState, User } from '../../types';
import { fetchToken } from '../../state/reducers/streamdeck';

import './StreamDeck.scss';
import { useSearchParams } from 'react-router';
import { fetchSoundboarderStatus } from '../../state/reducers/user';

const StreamDeck: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [ loading, setLoading ] = useState(true);

    const user: User | null = useSelector((state: RootState) => state.user.user);
    const token: string | null = useSelector((state: RootState) => state.streamdeck.token);
    const userFetchState: apiState | undefined = useSelector((state: RootState) => state.user.userFetchState);
    const tokenFetchState: apiState | undefined = useSelector((state: RootState) => state.streamdeck.tokenFetchState);
    const soundboardStatusFetchState: apiState | undefined = useSelector((state: RootState) => state.user.soundboardStatusFetchState);
    const [ searchParams ] = useSearchParams();

    
    const openDeepLink = (url: string) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }
    const sendToStreamdeck = () => openDeepLink(`streamdeck://plugins/message/com.joseph-claus.spl-soundboard/settings?token=${token}`);
    
    useEffect(() => {
        if (user && soundboardStatusFetchState === 'idle') {
            dispatch(fetchSoundboarderStatus());
            setLoading(true);
        }

        if (user && user.isSoundboardUser && tokenFetchState === 'idle' && token === null) {
            setLoading(true);
            dispatch(fetchToken());
        }

        if (userFetchState === 'fulfilled' && 
            soundboardStatusFetchState === 'fulfilled' && 
            tokenFetchState === 'fulfilled') {
            setLoading(false);
        }

        if (user && token && searchParams.get('broadcast')) {
            sendToStreamdeck();
        }
    }, [user, token, tokenFetchState]);

    return (
        <div className="streamdeck-configuration">
            <h1>Stream Deck Integration</h1>
            <p>Authorizing your Stream Deck plugin to control the soundboard.</p>

            {!user ? <>
                <p>Please <a href="#" onClick={() => window.location.href = "/login-sdauth"}>log in</a> to connect to StreamDeck.</p>
            </> : loading ? (
                <CircularProgress />
            ) : (
                <Button className='send-to-streamdeck' variant='contained' onClick={sendToStreamdeck}>
                    Open Stream Deck
                </Button>
            )}
        </div>
    );
}

export default StreamDeck;