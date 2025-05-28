import React, { useEffect, useState } from 'react';
import { Clip } from '../../../types';
import { Button, Menu, MenuItem, Divider, IconButton, ListItemText, ListItemSecondaryAction, Typography, ButtonGroup } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import SPLMenu, { SPLMenuItem } from '../../shared/Menu/SPLMenu';

import './PlayRandomSound.scss';

interface PlaySoundProps {
    classes?: string;
    isMyInstants: boolean;
    onPlayRandom: () => Clip | void;
    onPlayClip?: (clipId: string) => void;
    onSaveClip?: (clip: Clip) => void;
    disabled?: boolean;
}

const PlaySound: React.FC<PlaySoundProps> = ({
    classes = "",
    isMyInstants, 
    onPlayRandom, 
    onPlayClip = () => {},
    onSaveClip = () => {},
    disabled = false 
}) => {
    const [ menuAnchor, setMenuAnchor ] = useState<null | HTMLElement>(null);
    const [ history, setHistory ] = useState<Clip[]>([]);
    const [ items, setItems ] = useState<SPLMenuItem[]>([]);

    useEffect(() => {
        setHistory([]);
        setItems([]);
    }, [isMyInstants]);

    useEffect(() => {
        if (history.length === 0) setItems([{ node: <span>No history</span>, disabled: true }]);
        else {
            setItems(history.map((clip, idx) => ({
                node: (
                    <div className='history-item' key={clip.id || idx}>
                        <Typography variant='body2' noWrap>{clip.name}</Typography>
                        {isMyInstants && onSaveClip && (
                            <IconButton edge="end" onClick={() => onSaveClip(clip)} size="small">
                                <SaveIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>
                ),
                onClick: () => { 
                    onPlayClip(clip.id); 
                    setMenuAnchor(null);
                }
            })));
        }
    }, [history, isMyInstants, disabled]);

    return (
//         <ButtonGroup variant="contained" aria-label="Basic button group">
//   <Button>One</Button>
//   <Button>Two</Button>
//   <Button>Three</Button>
// </ButtonGroup>
        <>
            <ButtonGroup variant="contained" className={`random-sound ${classes}`} aria-label="Play Random Sound">
                <Button
                    className={`random-sound ${classes}`}
                    variant="contained"
                    onClick={() => {
                        //@ts-ignore
                        const clip: Clip = onPlayRandom();
                        if (!clip) return;
                        setHistory((prevHistory) => {
                            const newHistory = [...prevHistory, clip];
                            if (newHistory.length > 5) {
                                newHistory.shift();
                            }
                            return newHistory;
                        });
                    }}
                    disabled={disabled}
                    // endIcon={
                    //     <div className='menu-button-icon' onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    //             e.stopPropagation();
                    //             setMenuAnchor(e.currentTarget);
                    //     }}>
                    //         <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    //         <span style={{ cursor: 'pointer', paddingLeft: 8 }}>
                    //             ▼
                    //         </span>
                    //     </div>
                    // }
                >
                    Random
                </Button>
                <Button
                    className={`history-button ${classes}`}
                    variant="contained"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setMenuAnchor(e.currentTarget);
                    }}
                    disabled={disabled}
                >
                    <div className='menu-button-icon' onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            setMenuAnchor(e.currentTarget);
                    }}>
                        <span style={{ cursor: 'pointer', paddingLeft: 8 }}>
                            ▼
                        </span>
                    </div>
                </Button>
            </ButtonGroup>
            <SPLMenu
                classes={`play-random-sound ${classes}`}
                items={items}
                anchorEl={menuAnchor}
                onClose={() => setMenuAnchor(null)}
            />
        </>
    )
};

export default PlaySound;