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

    const onAction = (action: Function) => {
        setShowMenu(false);
        action(id);
    }

    const _onFavorite = () => {
        onFavorite(id);
    }

    const _onEdit = () => {
        onAction(onEdit);
    }

    const _onDelete = () => {
        onAction(onDelete);
    }

    return (
        <Paper className={`clip-card ${expanded ? 'highlighted' : ''}`.trim()} style={{ padding: 10 }} onClick={() => onAction(onClick)} onMouseOver={() => setExpanded(true)} onMouseOut={() => setExpanded(false)}>
            <Typography className='clip-name' variant="body1">{name}</Typography>
            <Typography className='clip-uploader' variant="caption">Uploaded by {uploadedBy}</Typography>
            <Typography className={`clip-description ${expanded ? 'show' : ''}`.trim()} variant="body2">{description}</Typography>
            <div className='clip-footer'>
                <div className='tags'>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            style={{ margin: '2px' }}
                            title={tag}
                        />
                    ))}
                </div>
                <div className='actions'>
                    {!useMenuBasedButtons ? <>
                        <PlayArrow onClick={(e) => { e.stopPropagation(); playAudio(); }} />
                        <Favorite className={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} />
                        <Edit onClick={_onEdit} />
                        {username === uploadedBy && <Delete onClick={_onDelete} />}
                    </> : <>
                        <MoreHoriz onClick={(e) => { e.stopPropagation(); setShowMenu(true); }} />
                    </>}
                </div>
                {useMenuBasedButtons && <div className={`mobile-actions ${showMenu ? 'show' : 'hide'}`.trim()}>
                    <div className='buttons'>
                        <div>
                            <PlayArrow onClick={(e) => { e.stopPropagation(); playAudio(); }} />
                            <Favorite className={`${isFavorite ? 'favorited' : ''}`.trim()} onClick={_onFavorite} />
                        </div>   
                        <div className='close'>
                            <Close onClick={() => setShowMenu(false)} />
                        </div>
                        <div>    
                            <Edit onClick={_onEdit} />
                            {username === uploadedBy && <Delete onClick={_onDelete} />}
                        </div>
                    </div>
                </div>}
            </div>
            <audio className='clip-audio' ref={audioFile} src={url} />
        </Paper>
    );
}

export default SoundboardClip;