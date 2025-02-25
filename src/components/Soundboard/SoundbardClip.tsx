import React, { useRef, useState } from 'react';
import { Chip, Paper, Typography } from "@mui/material";
import { Clip, User } from '../../types';
import { Delete, Edit, Favorite, PlayArrow } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

const SoundboardClip: React.FC<Clip & { 
    isFavorite?: boolean, 
    onClick: (clipId: string) => void, 
    onFavorite: (clipId: string) => void 
    onEdit: (clipId: string) => void
    onDelete: (clipId: string) => void
}> = ({
    id,
    name, 
    tags,
    description,
    uploadedBy,
    url,
    onClick,
    onFavorite,
    onEdit,
    onDelete,
    isFavorite = false
}) => {
    const audioFile = useRef(null);
    const [ expanded, setExpanded ] = useState(false);

    const username: string = useSelector((state: RootState) => state.user.user.username);

    const playAudio = () => {
        audioFile.current.play();
    }

    return (
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`} style={{ padding: 10 }} onClick={() => onClick(id)} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1">{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${expanded ? 'show' : ''}`} variant="body2">{description}</Typography>
            <div className='clip-footer'>
                <div className='tags'>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            style={{ margin: '2px' }}
                        />
                    ))}
                </div>
                <div className='actions'>
                    <PlayArrow onClick={playAudio} />
                    <Favorite className={`${isFavorite ? 'favorited' : ''}`} onClick={onFavorite.bind(this, id)} />
                    <Edit onClick={onEdit.bind(this, id)} />
                    {username === uploadedBy && <Delete onClick={onDelete.bind(this, id)} />}
                </div>
            </div>
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

export default SoundboardClip;