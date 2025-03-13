import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Box, Button, Chip, Container, FormControl, Grid2 as Grid, IconButton, Input, InputLabel, Link, Menu, MenuItem, Paper, Select } from '@mui/material';
import { GridLoader } from 'react-spinners';

import ConfigClipDialog from './ConfigClipDialog';
import DeleteClipDialog from './DeleteClipDialog';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { Clip, User } from '../../types';
import InfiniteScroll from 'react-infinite-scroll-component';
import SoundboardClip from './SoundboardClip';
import toastr from '../../utils/toastr';

import { Close, ExpandMore, Filter, FilterAlt, FilterAltOff, Search } from '@mui/icons-material';
import { fetchSoundboardClips, addClip, editClip, deleteClip, fetchMyInstantsTrending, fetchMyInstantsRecent, fetchMyInstantsByCategory, searchMyInstants, favoriteClip } from '../../state/reducers/soundboard';

import './Soundboard.scss';
import { experimentalStyled as styled } from '@mui/material/styles';

enum SortType {
    TITLE_ASC = "Title ▼",
    TITLE_DEC = "Title ▲",
    CREATED_ASC = "Created ▼",
    CREATED_DEC = "Created ▲",
    UPLOADER_ASC = "Uploader ▼",
    UPLOADER_DEC = "Uploader ▲",
}

const MYINSTANTS_UNSORTABLE = [
    SortType.CREATED_ASC,
    SortType.CREATED_DEC,
    SortType.UPLOADER_ASC,
    SortType.UPLOADER_DEC
]

enum MyInstantsCategory {
    ANIME = "Anime & Menga",
    GAMES = "Games",
    MEMES = "Memes",
    MOVIES = "Movies",
    MUSIC = "Music",
    POLITICS = "Politics",
    PRANKS = "Pranks",
    REACTIONS = "Reactions",
    SOUND_EFFECTS = "Sound Effects",
    SPORTS = "Sports",
    TELEVISION = "Television",
    TIKTOK_TRENDS = "TikTok Trends",
    VIRAL = "Viral"
}

export interface DialogClip extends Clip {
    isSavingMyInstant?: boolean;
}

type ClipType = 'saved' | 'trending' | 'recent' | MyInstantsCategory;

const devMode = process.env.NODE_ENV === 'development' ? true : false;
const DEFAULT_SOCKET_URL = devMode ? 'ws://localhost:8080/soundboard' : 'wss://joebotdiscord.com/soundboard';

const Soundboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [ socketUrl, setSocketUrl ] = useState<string | null>(null);
    const [ connectionAttempts, setConnectionAttempts ] = useState<number>(0);
    const [ hasBeenConnected, setHasBeenConnected ] = useState<boolean>(false);
    const [ messageHistory, setMessageHistory ] = useState<MessageEvent<{ type: string, sound?: string }>[]>([]);
    const [ fetchingClips, setFetchingClips ] = useState<boolean>(false);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ editingClip, setEditingClip ] = useState<DialogClip | null>(null);
    const [ deletingClip, setDeletingClip ] = useState<Clip | null>(null);
    const [ clipType, setClipType ] = useState<ClipType>('saved');
    const [ sortType, setSortType ] = useState<SortType>(SortType.TITLE_ASC);
    const [ socketUrlInput, setSocketUrlInput ] = useState<string | null>(DEFAULT_SOCKET_URL);
    const [ myInstantsPage, setMyInstantsPage ] = useState<number>(1);
    const [ favoritesOnly, setFavoritesOnly ] = useState<boolean>(false);
    const [ exclusionRules, setExclusionRules ] = useState<('all' | 'favorites' | 'created')[]>(['all']);
    const [ tagFilters, setTagFilters ] = useState<string[]>([]);

    const [ menuAnchorEl, setMenuAnchorEl ] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const [ subMenuAnchorEl, setSubMenuAnchorEl ] = React.useState<null | HTMLElement>(null);
    const subMenuOpen = Boolean(subMenuAnchorEl);

    const [ filterMenuAnchorEl, setFilterMenuAnchorEl ] = React.useState<null | HTMLElement>(null);
    const filterMenuOpen = Boolean(filterMenuAnchorEl);

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => {
        setDeletingClip(null);
        setEditingClip(null);
        setDialogOpen(false);
    }

    const lightMode: boolean = useSelector((state: RootState) => state.theme.lightMode);
    const user: User = useSelector((state: RootState) => state.user.user);
    const clips: Clip[] = useSelector((state: RootState) => state.soundboard.clips);
    const isMyInstants: boolean = useSelector((state: RootState) => state.soundboard.isMyInstants);

    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl, { 
        shouldReconnect: (closeEvent) => {
            setConnectionAttempts(connectionAttempts + 1);

            if (connectionAttempts > 5 || (devMode && connectionAttempts > 1)) {
                toastr.error("Can't establish connection to Joe_Bot. Please try again later.");
                return false;
            }
            // console.log("closeEvent: ", closeEvent);
            return true;
        },
        heartbeat: {
            interval: 5000,
            message: 'ping'
        }
    });

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
            console.log("fetching clips");
            setFetchingClips(true);
            dispatch(fetchSoundboardClips());
        }
    }, []);

    useEffect(() => {
        if (user && user.isSoundboardUser) {
            if (clips.length) setFetchingClips(false);
            if (!socketUrl) setSocketUrl(socketUrlInput || DEFAULT_SOCKET_URL);
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

    useEffect(() => {
        setSortType(SortType.TITLE_ASC);
    }, [isMyInstants])

    const playClip = (clipId: string) => {
        const clip: Clip | undefined = clips.find(c => {
            return c.id === clipId
        });
        if (clip && clip.url && readyState === ReadyState.OPEN) {
            sendJsonMessage({ type: 'play_sound', sound: clip.url, volume: clip.volume ?? 50, caller: user.id });
        }
    };

    const _addOrEditClip = (clip: Clip) => {
        if (editingClip && !editingClip.isSavingMyInstant) {
            dispatch(editClip(clip));
        } else {
            dispatch(addClip({ ...clip, uploadedBy: user?.username }));
        }
    }

    const _deleteClip = (clip: DialogClip) => {
        setDeletingClip(clip);
    }

    const playRandomClip = () => {
        const randomIndex = Math.floor(Math.random() * clips.length);
        playClip(clips[randomIndex].id);
    }

    const _favoriteClip = (clipId: string) => {
        dispatch(favoriteClip(clipId));
    }

    const openClipEdit = (clip: DialogClip) => {
        if (clip) {
            setEditingClip(clip);
            openDialog();
        }
    }

    const filteredClips = Array.from(clips).filter(clip => {
        let included: boolean = true;
        if (exclusionRules.includes('all')) return included;
        if (exclusionRules.includes('favorites') && !clip.favoritedBy.includes(user.id)) included = false;
        if (exclusionRules.includes('created') && clip.uploadedBy.trim() !== user.username.trim()) included = false;
        
        return included;
    }).sort((a: Clip, b: Clip) => {
        switch (sortType) {
            case SortType.TITLE_ASC:
                return a.name.localeCompare(b.name);
            case SortType.TITLE_DEC:
                return b.name.localeCompare(a.name);
            case SortType.CREATED_DEC:
                return new Date(a.createdAt)?.getTime() - new Date(b.createdAt)?.getTime();
            case SortType.CREATED_ASC:
                return new Date(b.createdAt)?.getTime() - new Date(a.createdAt)?.getTime();
            case SortType.UPLOADER_ASC:
                return a.uploadedBy.localeCompare(b.uploadedBy);
            case SortType.UPLOADER_DEC:
                return b.uploadedBy.localeCompare(a.uploadedBy);
        }
    }).filter(clip => {
        if (!searchTerm || isMyInstants) return true;
        return (clip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clip.tags.map(t => t.toLowerCase()).includes(searchTerm.toLowerCase()) ||
                clip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tagFilters.find(tf => clip.tags.includes(tf)) !== undefined);
    });

    const getClips = (type: ClipType) => {
        closeAllMenus();
        if (clipType !== type) setClipType(type);
        switch (type) {
            case 'saved':
                dispatch(fetchSoundboardClips());
                break;
            case 'trending':
                dispatch(fetchMyInstantsTrending(myInstantsPage));
                break;
            case 'recent':
                dispatch(fetchMyInstantsRecent(myInstantsPage));
                break;
            default:
                dispatch(fetchMyInstantsByCategory({ category: type, page: myInstantsPage }));
                break;
        }

        setMenuAnchorEl(null);
        setSubMenuAnchorEl(null);
    }

    const clearMyInstantsSearch = () => {
        setSearchTerm('');
        getClips(clipType);
    }

    const addTagFilter = (filter: string) => {
        setTagFilters([...tagFilters, filter]);
    }

    const removeTagFilter = (filter: string) => {
        setTagFilters(tagFilters.filter(tag => tag !== filter));
    }

    const closeAllMenus = () => {
        setMenuAnchorEl(null);
        setSubMenuAnchorEl(null);
        setFilterMenuAnchorEl(null);
    }

    const _setExclusionRules = (rule: 'all' | 'favorites' | 'created') => {
        setFilterMenuAnchorEl(null);
        if (rule === 'all') {
            setExclusionRules(['all']);
        } else {
            if (exclusionRules.includes('all')) {
                setExclusionRules([rule]);
            } else if (exclusionRules.includes(rule)) {
                const newRules = exclusionRules.filter(r => r !== rule);
                if (!newRules.length) newRules.push('all');
                setExclusionRules(newRules);
            } else {
                setExclusionRules([...exclusionRules, rule]);
            }
        }
    }

    const endOfClipsString: string = isMyInstants && clips.length >= 200 ? 'You\'ve loaded the maximum amount of buttons' : 'That\s it, you\'ve loaded all the buttons!';
    console.log("exclusionRules: ", exclusionRules);
    return (
        <>
            {!user || !user.isSoundboardUser ? <div className='no-soundboard-access'>You must have the correct role access to access this page. If you feel this is incorrect, contact an admin.</div> : null}
            {user && user.isSoundboardUser && clips.length > 0 && <div className='soundboard'> 
                <DeleteClipDialog clip={deletingClip} open={deletingClip !== null} onClose={closeDialog} onDelete={() => { dispatch(deleteClip(deletingClip)); }} />
                <ConfigClipDialog clip={editingClip} open={dialogOpen} onClose={closeDialog} onSave={_addOrEditClip} />
                <Menu
                    aria-labelledby="my-instants-button"
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={closeAllMenus}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem disabled={!isMyInstants} onClick={() => getClips('saved')}>Saved Clips</MenuItem>
                    <MenuItem onClick={() => getClips('trending')}>Get Trending</MenuItem>
                    <MenuItem onClick={() => getClips('recent')}>Get Newest</MenuItem>
                    <MenuItem id='my-instants-get-by-category' onMouseEnter={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => { if (menuOpen) setSubMenuAnchorEl(e.currentTarget)}}>Get by category <ExpandMore /></MenuItem>
                </Menu>
                <Menu
                    aria-labelledby='my-instants-get-by-category'
                    anchorEl={subMenuAnchorEl}
                    open={subMenuOpen}
                    onClose={closeAllMenus}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onMouseLeave={() => setSubMenuAnchorEl(null)}
                >
                    {Object.values(MyInstantsCategory).map((category, i) => {
                        return <MenuItem key={i} onClick={() => getClips(category)}>{category}</MenuItem>
                    })}
                </Menu>
                <Menu
                    anchorEl={filterMenuAnchorEl}
                    open={filterMenuOpen}
                    onClose={closeAllMenus}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem selected={exclusionRules.length === 1 && exclusionRules[0] === 'all'} onClick={() => _setExclusionRules('all')}>All</MenuItem>
                    <MenuItem selected={exclusionRules.includes('favorites')} onClick={() => _setExclusionRules('favorites')}>Favorites</MenuItem>
                    <MenuItem selected={exclusionRules.includes('created')} onClick={() => _setExclusionRules('created')}>Created By Me</MenuItem>
                </Menu>
                <div className='info-header'>
                    <div className='header-text'><h1>Joe_Bot Soundboard</h1></div>    
                    <div className='my-instants-link'>
                        <span>
                            Looking for more sounds or a place to host sounds? <Link target="_blank" href='https://www.myinstants.com/en/index/us/'>Click here!</Link>
                        </span>
                    </div>
                </div>
                <div className='grid-actions'>
                    <div className='status-section'>
                        <p className='status'>Connection status: <span className={getConnectionStatusClass()}>{connectionStatus}</span></p>
                        {devMode && <div className='websocket-setup'>
                            <Input
                                className='websocket-input'
                                placeholder='WebSocket URL'
                                value={socketUrlInput}
                                onChange={(e) => setSocketUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (socketUrlInput !== '') {
                                            setSocketUrl(socketUrlInput);
                                        } else {
                                            setSocketUrl(null);
                                        }

                                        setConnectionAttempts(0);
                                        setMessageHistory([]);
                                    }
                                }}
                            />
                        </div>}
                    </div>
                    <div className='my-instants-button'>
                        <div className='circle small-button-background'></div>
                        <button id='my-instants-button' onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchorEl(e.currentTarget)} />
                    </div>
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
                                {Object.values(SortType).filter((sortType, i) => {
                                    switch (sortType) {
                                        case SortType.TITLE_ASC:
                                            return true;
                                        case SortType.TITLE_DEC:
                                            return true;
                                        case SortType.CREATED_ASC:
                                            if (isMyInstants) return false;
                                            return true;
                                        case SortType.CREATED_DEC:
                                            if (isMyInstants) return false;
                                            return true;
                                        case SortType.UPLOADER_ASC:
                                            if (isMyInstants) return false;
                                            return true;
                                        case SortType.UPLOADER_DEC:
                                            if (isMyInstants) return false;
                                            return true;
                                    }
                                }).map((sortType, i) => {
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
                <Container className='active-tag-search-section'>
                    {tagFilters.map((tag, i) => {
                        return (
                            <Chip 
                                key={i} 
                                label={tag} 
                                onDelete={() => removeTagFilter(tag)} 
                            />
                        );
                    })}
                </Container>
                <Container className='search-section'>
                    <Input
                        sx={{ color: 'inherit' }}
                        name='clip-search'
                        className='search-bar'
                        placeholder={isMyInstants ? "Search MyInstants" : "Search sounds..."}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = event.target.value;

                            if (newValue === '') {
                                getClips(clipType);
                            }

                            setSearchTerm(event.target.value)
                        }}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                            if (!isMyInstants) return;

                            if (event.key === 'Enter') {
                                dispatch(searchMyInstants({ search: searchTerm, page: 1 }));
                            }
                        }}
                        value={searchTerm}
                        endAdornment={isMyInstants ? <Close onClick={clearMyInstantsSearch} /> : <Search />}
                    />
                    <IconButton sx={{ color: 'inherit' }} onClick={(e) => setFilterMenuAnchorEl(e.currentTarget)}>
                        {exclusionRules.length === 1 && exclusionRules[0] === 'all' ? <FilterAltOff /> : <FilterAlt />}
                    </IconButton>
                </Container>
            </div>}
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <InfiniteScroll
                    dataLength={clips.length} //This is important field to render the next data
                    next={() => {
                        if (isMyInstants && clips.length <= 200) {
                            setMyInstantsPage(myInstantsPage + 1);
                            getClips(clipType);
                        }
                    }}
                    hasMore={isMyInstants && clips.length <= 200}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                        <b>{endOfClipsString}</b>
                        </p>
                    }
                >
                    <Grid className='soundboard-items' container spacing={{ xs: 1, sm: 2 }} columns={{ xs: 2, md: 6, lg: 10 }}>
                        <Grid className='loading' size='grow' sx={{ display: 'none' }}><GridLoader color={lightMode ? 'black' : 'white'} loading={fetchingClips} size={50} margin='auto' /></Grid>
                        {filteredClips.length > 0 && filteredClips.map((clip, index) => (
                            <Grid key={index} size={{ xs: 1, md: 2 }}>
                                <SoundboardClip 
                                    {...clip}
                                    filterByTag={addTagFilter}
                                    onClick={playClip} 
                                    onFavorite={_favoriteClip}
                                    onEdit={openClipEdit}
                                    onDelete={_deleteClip}
                                    isMyInstant={isMyInstants}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </InfiniteScroll>
            </Box>
        </>
    );
};

export default Soundboard;