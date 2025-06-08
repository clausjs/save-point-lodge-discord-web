import React, { useState } from 'react';
import { Input } from '@mui/material';
import { CheckCircle, Close, Sync } from '@mui/icons-material';
import { ReadyState } from 'react-use-websocket';

import './ConnectionStatus.scss';

const devMode = process.env.NODE_ENV === 'development';
const DEFAULT_SOCKET_URL = devMode ? 'ws://localhost:8080/soundboard' : 'wss://joebotdiscord.com/soundboard';

export interface ConnectionStatusProps {
    socketUrl: string | null;
    readyState: ReadyState;
    onChange: (url: string | null) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    readyState,
    onChange
}) => {
    const [ urlInput, setUrlInput ] = useState<string>('');

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

    const getConnectionStatusIcon = () => {
        switch (readyState) {
            case ReadyState.CONNECTING:
                return <Sync sx={{ fontSize: 10 }} />;
            case ReadyState.OPEN:
                return <CheckCircle sx={{ fontSize: 10 }} />;
            case ReadyState.CLOSING:
                return <Close sx={{ fontSize: 10 }} />;
            case ReadyState.CLOSED:
                return <Close sx={{ fontSize: 10 }} />;
            default:
                return '';
        }
    }

    return (
        <div className='connection-status'>
            <div className='status'>
                <div className={`status-icon ${getConnectionStatusClass()}`}>{getConnectionStatusIcon()}</div>
                <span className={`status-text ${getConnectionStatusClass()}`}>Connection status: <span className={getConnectionStatusClass()}>{connectionStatus}</span></span>
            </div>
            {devMode && <div className='websocket-setup'>
                <Input
                    fullWidth
                    sx={{ color: 'inherit' }}
                    className='websocket-input'
                    placeholder='WebSocket URL'
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (urlInput !== '') {
                                onChange(urlInput);
                            } else {
                                onChange(null);
                            }
                        }
                    }}
                    endAdornment={<Close onClick={(e) => {
                        e.stopPropagation();
                        setUrlInput(DEFAULT_SOCKET_URL);
                        onChange(null);
                    }} />}
                />
            </div>}
        </div>
    );
}

export default ConnectionStatus;