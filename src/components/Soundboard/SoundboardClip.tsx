import React, { useRef, useState } from 'react';
import { Chip, Paper, Typography, useMediaQuery } from "@mui/material";
import { Clip, User } from '../../types';
import { Close, Delete, Edit, Favorite, MoreHoriz, PlayArrow } from '@mui/icons-material';
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
    const useMenuBasedButtons = useMediaQuery('(max-width: 1350px)');
    const audioFile = useRef(null);
    const [ expanded, setExpanded ] = useState(false);
    const [ showMenu, setShowMenu ] = useState(false);

    const username: string = useSelector((state: RootState) => state.user.user.username);

    const playAudio = () => {
        audioFile.current.play();
    }

    const getBottomContent = () => {
        if (useMenuBasedButtons) {
            if (showMenu) {
                return (
                    <div className='mobile-actions'>
                        <PlayArrow onClick={(e) => { e.stopPropagation(); playAudio(); }} />
                        <Favorite className={`${isFavorite ? 'favorited' : ''}`} onClick={onFavorite.bind(this, id)} />
                        <Edit onClick={onEdit.bind(this, id)} />
                        {username === uploadedBy && <Delete onClick={onDelete.bind(this, id)} />}
                        <Close onClick={() => setShowMenu(false)} />
                    </div>
                );
            } else {
                return (
                    <>
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
                            <MoreHoriz onClick={() => setShowMenu(true)} />
                        </div>
                    </>
                )
            }
        } else {
            return (
                <>
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
                        <PlayArrow onClick={(e) => { e.stopPropagation(); playAudio(); }} />
                        <Favorite className={`${isFavorite ? 'favorited' : ''}`} onClick={onFavorite.bind(this, id)} />
                        <Edit onClick={onEdit.bind(this, id)} />
                        {username === uploadedBy && <Delete onClick={onDelete.bind(this, id)} />}
                    </div>
                </>
            )
        }
    }

    return (
        <Paper className={`clip-card ${!useMenuBasedButtons && expanded ? 'highlighted' : ''}`} style={{ padding: 10 }} onClick={() => onClick(id)} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1">{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${((!useMenuBasedButtons && expanded) || showMenu) ? 'show' : ''}`} variant="body2">{description}</Typography>
            <div className='clip-footer'>
                {getBottomContent()}
            </div>
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

export default SoundboardClip;