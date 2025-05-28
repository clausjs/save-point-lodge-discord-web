import React, { useState, useCallback, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Box, Button, Chip, Checkbox, Container, FormControl, Grid2 as Grid, IconButton, Input, InputLabel, Link, Menu, MenuItem, Paper, Select, Typography } from '@mui/material';
import { GridLoader } from 'react-spinners';

import ConfigClipDialog from './Dialogs/ConfigClipDialog';
import DeleteClipDialog from './Dialogs/DeleteClipDialog';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { Clip, User } from '../../types';
import InfiniteScroll from 'react-infinite-scroll-component';
import SoundboardClip from './SoundboardClip';
import toastr from '../../utils/toastr';

import { ArrowDownward, ArrowUpward, Close, ExpandMore, Filter, FilterAlt, FilterAltOff, Search, Stop } from '@mui/icons-material';
import { fetchSoundboardClips, addClip, editClip, deleteClip, fetchMyInstantsTrending, fetchMyInstantsRecent, fetchMyInstantsByCategory, searchMyInstants, favoriteClip, resetClips } from '../../state/reducers/soundboard';

import './Soundboard.scss';
import SoundTypeToggle from './SoundTypeToggle';
import CategorySelectMenu, { ClipCategory, MyInstantsCategory, MyInstantType, SavedClipCategory } from './Menus/Categories';
import ClipActionButton from './Buttons/ClipActionButton';
import FilterMenu, { FilterRules } from './Menus/FilterMenu';
import PlaySound from './Buttons/PlayRandomSound';
import ConnectionStatus from './ConnectionStatus';
import NowPlaying from './Buttons/NowPlaying/NowPlaying';

enum SortType {
    TITLE = "Title",
    DURATION = "Length",
    CREATED = "Created",
    UPLOADER = "Uploader",
}

enum SortDir {
    ASC = "asc",
    DEC = "dec"
}

const MY_INSTANTS_DISABLED_SORT_TYPES = [SortType.CREATED, SortType.UPLOADER];

type ClipType = 'saved' | 'myinstants';

export interface DialogClip extends Clip {
    isSavingMyInstant?: boolean;
}

const devMode = process.env.NODE_ENV === 'development' ? true : false;
const DEFAULT_SOCKET_URL = devMode ? 'ws://localhost:8080/soundboard' : 'wss://joebotdiscord.com/soundboard';

const Soundboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const durations = useRef<{ [key: string]: number }>({});
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
    const [ category, setCategory ] = useState<SavedClipCategory | MyInstantType<MyInstantsCategory | undefined>>('all');
    const [ isSearching, setIsSearching ] = useState<boolean>(false);
    const [ sortType, setSortType ] = useState<SortType | null>(SortType.TITLE);
    const [ sortDir, setSortDir ] = useState<SortDir>(SortDir.ASC);
    const [ disabledSortTypes, setDisabledSortTypes ] = useState<SortType[]>([]);
    const [ myInstantsPage, setMyInstantsPage ] = useState<number>(1);
    const [ exclusionRules, setExclusionRules ] = useState<FilterRules[]>([FilterRules.ALL]);
    const [ tagFilters, setTagFilters ] = useState<string[]>([]);
    const [ nowPlaying, setNowPlaying ] = useState<Clip & { caller: string } | null>(null);

    const [ filterMenuAnchorEl, setFilterMenuAnchorEl ] = React.useState<null | HTMLElement>(null);

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
    const isLastResults: boolean = useSelector((state: RootState) => state.soundboard.lastResults);

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

    const loadedClipDuration = (id: string, duration: number) => {
        if (clips.find(c => c.id === id) && !durations.current[id]) {
            durations.current = { ...durations.current, [id]: duration };
        }
    }

    useEffect(() => {
        if (!user) return;
        if (!user.isSoundboardUser) return;
        if (!clips.length) {
            setFetchingClips(true);
            dispatch(fetchSoundboardClips());
        }
    }, []);

    useEffect(() => {
        if (clipType === 'saved') {
            setSearchTerm('');
            getClips('saved');
            setCategory('all');
        } else {
            setCategory('trending');
            setMyInstantsPage(1);
            getClips('myinstants');
        }
    }, [clipType]);

    useEffect(() => {
        if (isMyInstants) {
            dispatch(resetClips());
            getClips(clipType);
        }
    }, [category]);

    useEffect(() => {
        if (user && user.isSoundboardUser) {
            if (clips.length) setFetchingClips(false);
            if (!socketUrl) setSocketUrl(DEFAULT_SOCKET_URL);
        }

        //DELETE ME
        setNowPlaying({ ...clips[0], name: 'Something really really really long that will purposefully overflow', caller: 'ice2morrow' })
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
            case ReadyState.CLOSING:
                break;
            default:
                if (hasBeenConnected) toastr.error("Can't establish connection to Joe_Bot");
        }
    }, [readyState]);

    const isValidJson = (data: string): boolean => {
        try {
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
            if (isValidJson(lastMessage.data)) {
                const data = JSON.parse(lastMessage.data);
                if (data.type === 'now_playing') {
                    if (data.id) {
                        const clip: Clip | undefined = clips.find(c => c.id === data.id);
                        if (clip) setNowPlaying({ ...clip, caller: data.caller });
                    }
                }
                if (data.type === 'clip_ended') setNowPlaying(null);
            }
        }
    }, [lastMessage]);

    useEffect(() => {
        if (isMyInstants) {
            if (!isLastResults) {
                setSortType(null);
                setDisabledSortTypes(Object.values(SortType));
            }
            else {
                setSortType(SortType.TITLE);
                setSortDir(SortDir.ASC);
                setDisabledSortTypes(MY_INSTANTS_DISABLED_SORT_TYPES);
            }
        } else {
            setSortType(SortType.TITLE);
            setDisabledSortTypes([]);
        }
    }, [isMyInstants])

    useEffect(() => {
        if (isMyInstants) {
            if (isLastResults) setDisabledSortTypes(MY_INSTANTS_DISABLED_SORT_TYPES);
            else setDisabledSortTypes(Object.values(SortType));
        } else setDisabledSortTypes([]);
    }, [isLastResults]);

    const playClip = (clipId: string, volumeOverride?: number) => {
        const clip: Clip | undefined = clips.find(c => {
            return c.id === clipId
        });
        if (clip && clip.url && readyState === ReadyState.OPEN) {
            sendJsonMessage({ type: 'play_sound', ...clip, sound: clip.url, volume: volumeOverride ?? clip.volume ?? 50, caller: user.id });
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

    const playRandomClip = (): Clip | void => {
        const randomIndex = Math.floor(Math.random() * filteredClips.length);
        const clip: Clip | undefined = filteredClips[randomIndex];
        if (!clip) return;
        playClip(clip.id);
        return clip;
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

        // Tag filtering
        if (tagFilters.length) {
            included = tagFilters.some(tag => clip.tags.includes(tag));
        }

        // Filter filtering
        if (exclusionRules.includes(FilterRules.FAVORITES) && !clip.favoritedBy?.includes(user.id)) included = false;
        if (exclusionRules.includes(FilterRules.CREATED) && clip.uploadedBy.trim() !== user.username.trim()) included = false;

        // Category filtering
        if (!isMyInstants) {
            if (category !== 'all' && clip.category !== category) {
                included = false;
            }
        }

        return included;
    }).sort((a: Clip, b: Clip) => {        
        switch (sortType) {
            case SortType.TITLE:
                if (sortDir === SortDir.ASC) {
                    return a.name.localeCompare(b.name);
                } else if (sortDir === SortDir.DEC) {
                    return b.name.localeCompare(a.name);
                }
                break;
            case SortType.CREATED:
                if (sortDir === SortDir.ASC) {
                    return new Date(a.createdAt)?.getTime() - new Date(b.createdAt)?.getTime();
                } else if (sortDir === SortDir.DEC) {
                    return new Date(b.createdAt)?.getTime() - new Date(a.createdAt)?.getTime();
                }
                break;
            case SortType.UPLOADER:
                if (sortDir === SortDir.ASC) {
                    return a.uploadedBy.localeCompare(b.uploadedBy);
                } else if (sortDir === SortDir.DEC) {
                    return b.uploadedBy.localeCompare(a.uploadedBy);
                }
                break;
            case SortType.DURATION:
                const timeA = durations.current[a.id];
                const timeB = durations.current[b.id];
                if (!timeA || !timeB) return 0;

                if (sortDir === SortDir.ASC) {
                    return (timeA) - (timeB);
                }
                else if (sortDir === SortDir.DEC) {
                    return (timeB) - (timeA);
                }
            default:
                return 0;
        }
    }).filter(clip => {
        if (!searchTerm || isMyInstants) return true;
        return (clip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clip.tags.map(t => t.toLowerCase()).includes(searchTerm.toLowerCase()) ||
                clip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const closeAllMenus = () => {
        setFilterMenuAnchorEl(null);
    }

    const getClips = useCallback((type: ClipType, page: number = myInstantsPage) => {
        closeAllMenus();

        switch (type) {
            case 'saved':
                dispatch(fetchSoundboardClips());
                break;
            case 'myinstants':
                switch (category) {
                    case 'all':
                    case 'trending':
                        dispatch(fetchMyInstantsTrending(page));
                        break;
                    case 'recent':
                        dispatch(fetchMyInstantsRecent(page));
                        break;
                    default:
                        dispatch(fetchMyInstantsByCategory({ category: category, page }));
                        break;
                }
                break;
        }
    }, [clipType, category, myInstantsPage]);

    const clearMyInstantsSearch = () => {
        setSearchTerm('');
        if (isSearching) {
            dispatch(resetClips());
            setIsSearching(false);
            setMyInstantsPage(1);
            getClips(clipType, 1);
        }
    }

    const addTagFilter = (filter: string) => {
        if (tagFilters.includes(filter)) return;
        setTagFilters([...tagFilters, filter]);
    }

    const removeTagFilter = (filter: string) => {
        setTagFilters(tagFilters.filter(tag => tag !== filter));
    }

    const _setExclusionRules = (rule: FilterRules) => {
        setFilterMenuAnchorEl(null);
        if (rule === FilterRules.ALL) {
            setExclusionRules([FilterRules.ALL]);
        } else {
            if (exclusionRules.includes(FilterRules.ALL)) {
                setExclusionRules([rule]);
            } else if (exclusionRules.includes(rule)) {
                const newRules = exclusionRules.filter(r => r !== rule);
                if (!newRules.length) newRules.push(FilterRules.ALL);
                setExclusionRules(newRules);
            } else {
                setExclusionRules([...exclusionRules, rule]);
            }
        }
    }

    const onSortingChange = (type: SortType) => {
        if (sortType === type) {
            if (sortDir === SortDir.ASC) {
                setSortDir(SortDir.DEC);
            } else {
                setSortDir(SortDir.ASC);
            }
        } else {
            setSortType(type);
            setSortDir(SortDir.ASC);
        }
    }

    const _setCategory = (newCategory: SavedClipCategory | MyInstantType<MyInstantsCategory | undefined>) => {
        if (category !== newCategory) {
            setMyInstantsPage(1);
            setCategory(newCategory);
        }
    }

    const endOfClipsString: string = isMyInstants && clips.length >= 200 ? 'You\'ve loaded the maximum amount of buttons' : 'That\s it, you\'ve loaded all the buttons!';
    const disableControls: boolean = !clips.length;

    return (
        <>
            <DeleteClipDialog clip={deletingClip} open={deletingClip !== null} onClose={closeDialog} onDelete={() => { dispatch(deleteClip(deletingClip)); }} />
            <ConfigClipDialog clip={editingClip} open={dialogOpen} onClose={closeDialog} onSave={_addOrEditClip} />
            <div className='info-header'>
                <div className='header'>
                    <div style={{ flex: 1 }}>
                        <ConnectionStatus
                            readyState={readyState}
                            onChange={(url: string | null) => {
                                setSocketUrl(url);
                            }}
                            socketUrl={socketUrl}
                        />
                    </div>
                    <h1>Joe_Bot Soundboard</h1>
                    <div style={{ flex: 1 }}></div>
                </div>    
                <div className='my-instants-link'>
                    <span>
                        Looking for more sounds or a place to host sounds? <Link target="_blank" href='https://www.myinstants.com/en/index/us/'>Click here!</Link>
                    </span>
                </div>
            </div>
            {!user || !user.isSoundboardUser ? <div className='no-soundboard-access'>You must have the correct role access to access this page. If you feel this is incorrect, contact an admin.</div> : null}
            {user && user.isSoundboardUser && <div className='soundboard'> 
                <div className='grid-actions'>
                    <div style={{ flex: 1 }}>
                        <NowPlaying
                            clip={nowPlaying}
                            onStop={() => {
                                sendJsonMessage({ type: 'stop_sound', caller: user.id });
                                setNowPlaying(null);
                            }}
                        />
                    </div>
                    <div className='my-instants-button'>
                        <SoundTypeToggle 
                            isMyInstants={isMyInstants}
                            onToggle={(e) => {
                                setMyInstantsPage(1);
                                durations.current = {};
                                if (!isMyInstants) {
                                    setClipType('myinstants');
                                } else {
                                    setClipType('saved');
                                }
                            }}
                        />
                    </div>
                    <CategorySelectMenu
                        category={category}
                        onChange={_setCategory}
                        isMyInstants={isMyInstants}
                    />
                    <div className='button-grp'>
                        <Button disabled={!user.isSoundboardUser} className='grid-action' variant="contained" onClick={openDialog}>Add Clip</Button>
                        <PlaySound
                            isMyInstants={isMyInstants}
                            onPlayRandom={playRandomClip}
                            onPlayClip={playClip}
                            onSaveClip={(clip) => {
                                setEditingClip(clip);
                                openDialog();
                            }}
                            disabled={disableControls}
                        />
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
                        disabled={disableControls}
                        name='clip-search'
                        className='search-bar'
                        placeholder={isMyInstants ? "Search MyInstants" : "Search sounds..."}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = event.target.value;

                            if (newValue === '') {
                                clearMyInstantsSearch();
                            }

                            setSearchTerm(event.target.value)
                        }}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                            if (!isMyInstants) return;

                            if (event.key === 'Enter') {
                                setMyInstantsPage(1);
                                setIsSearching(true);
                                dispatch(resetClips());
                                dispatch(searchMyInstants({ search: searchTerm, page: 1 }));
                            }
                        }}
                        value={searchTerm}
                        startAdornment={<Search />}
                        endAdornment={<Close onClick={(e) => {
                            clearMyInstantsSearch();
                        }} />}
                    />
                    <FilterMenu
                        filters={exclusionRules}
                        setFilter={_setExclusionRules}
                    />
                </Container>
                <Container className='sort-section'>
                    {Object.values(SortType).map((type, i) => {
                        return (
                            <Chip 
                                icon={type !== sortType ? undefined : sortDir === SortDir.ASC ? <ArrowUpward /> : <ArrowDownward />}
                                key={i}
                                label={type} 
                                variant={sortType === type ? 'filled' : 'outlined'} 
                                disabled={disabledSortTypes.includes(type)} 
                                onClick={() => onSortingChange(type)} 
                            />
                        );
                    })}
                </Container>
            </div>}
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <InfiniteScroll
                    dataLength={clips.length} //This is important field to render the next data
                    next={() => {
                        if (isMyInstants) {
                            const page = myInstantsPage + 1;
                            setMyInstantsPage(page);
                            if (isSearching) {
                                dispatch(searchMyInstants({ search: searchTerm, page }));
                            } else {
                                getClips(clipType, page);
                            }
                        }
                    }}
                    hasMore={isMyInstants && (clips.length <= 200 && !isLastResults)}
                    loader={clips.length > 0 ? <h4>Loading...</h4> : null}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>{endOfClipsString}</b>
                        </p>
                    }
                >
                    <Grid className='soundboard-items' container spacing={{ xs: 1, sm: 2 }} columns={{ xs: 2, md: 6, lg: 10 }}>
                        {clips.length === 0 && fetchingClips && <Grid className='loading' size='grow'><GridLoader color={lightMode ? 'black' : 'white'} loading={fetchingClips} size={50} margin='auto' /></Grid>}
                        {filteredClips.length > 0 && filteredClips.map((clip, index) => (
                            <Grid key={index} size={{ xs: 1, md: 2 }}>
                                <SoundboardClip 
                                    {...clip}
                                    filterByTag={addTagFilter}
                                    filterByCategory={_setCategory}
                                    onDurationLoaded={loadedClipDuration}
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