import React, { useEffect } from 'react';
import { Clip } from '../../../../types';
import { MusicNote, Stop } from '@mui/icons-material';

import './NowPlaying.scss';
import { DoubleNoteIcon } from './DoubleNoteIcon';

interface NowPlayingProps {
    clip: Clip & { caller?: string; };
    onStop: () => void;
}


export default function NowPlaying({ clip: sound, onStop }: NowPlayingProps) {
  const isPlaying = Boolean(sound);

  return (
    <div className={`now-playing-card ${isPlaying ? 'playing' : 'idle'}`}>
      {!isPlaying ? (
        <div className="idle-content">
            <DoubleNoteIcon />
            <span>Nothing currently playing</span>
        </div>
      ) : (
        <div className="active-content">
          <div className="content-info">
            <div className="label">NOW PLAYING</div>
            <div className="title" title={sound.name}>{sound.name}</div>
            {sound.caller && <div className="uploader">Played by: {sound.caller}</div>}
            <div className="equalizer">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          <button className="stop-button" onClick={onStop}>
            <Stop sx={{ fontSize: 28 }} />
          </button>
        </div>
      )}
    </div>
  );
}