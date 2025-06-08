import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { CircularProgress, Tooltip } from '@mui/material';
import { CopyAll } from '@mui/icons-material';

import { AppDispatch, RootState } from '../../state/store';
import { apiState } from '../../types';
import { fetchToken } from '../../state/reducers/streamdeck';

import './StreamDeck.scss';

const StreamDeck = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(true);
    const [ showCopiedTooltip, setShowCopiedTooltip ] = useState(false);

    const token: string | null = useSelector((state: RootState) => state.streamdeck.token);
    const tokenFetchState: apiState = useSelector((state: RootState) => state.streamdeck.tokenFetchState);

    useEffect(() => {
        if (tokenFetchState === 'idle' && token === null) {
            setLoading(true);
            dispatch(fetchToken());
        }
    }, []);

    useEffect(() => {
        if (tokenFetchState === 'fulfilled') {
            setLoading(false);
        }
    }, [token, tokenFetchState]);

    return (
        <div className="streamdeck-configuration">
            <h1>Stream Deck Integration</h1>
            <p>Authorize your Stream Deck plugin to control the soundboard by using this token.</p>

            {loading ? (
                <CircularProgress />
            ) : (
                <div className="token-box">
                    <label>Your Token:</label>
                    <div className='token-display'>
                        <span>{token}</span>
                        <Tooltip title="Token copied to clipboard" open={showCopiedTooltip}>
                            <CopyAll
                                className='copy-icon'
                                onClick={() => {
                                    if (token) {
                                        navigator.clipboard.writeText(token);
                                        setShowCopiedTooltip(true);
                                        setTimeout(() => setShowCopiedTooltip(false), 1500);
                                    }
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StreamDeck;