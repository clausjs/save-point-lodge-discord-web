import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    TextField, MenuItem, Select, FormControl, InputLabel, Chip, 
    SelectChangeEvent,
    Stack,
    Slider,
    Autocomplete,
    createFilterOptions
} from '@mui/material';
import { apiState } from '../../types';
import { Pause, PlayArrow, Save, VolumeDown, VolumeUp } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import toastr from '../../utils/toastr';

import './ConfigClipDialog.scss';
import ClipActionButton from './ClipActionButton';
import { DialogClip } from './Soundboard';
import { ClipCategory } from './Categories';

interface TagAutoCompleteOption {
    inputValue?: string; // for custom input
    title: string; // display value
}

const filter = createFilterOptions<TagAutoCompleteOption>();

interface ConfigClipDialogProps {
    clip?: DialogClip;
    open: boolean;
    onClose: () => void;
    onSave: (clip: any) => void;
}

const EMPTY_CLIP: DialogClip = {
    id: '',
    name: '',
    description: '',
    url: '',
    uploadedBy: '',
    tags: [],
    category: ClipCategory.UNCATEGORIZED,
    playCount: 0,
    volume: 50,
    isSavingMyInstant: false
}

const ConfigClipDialog: React.FC<ConfigClipDialogProps> = ({ clip: editClip, open, onClose, onSave }) => {
    const audioFile = useRef(null);
    const [ submitted, setSubmitted ] = useState<'add' | 'edit' | null>(null);
    const [tags, setTags] = useState<string[]>(editClip ? editClip.tags : []);
    const [ tagInput, setTagInput ] = useState<TagAutoCompleteOption>({ title: '' });
    const [clipData, setClipData] = useState<DialogClip>(editClip ?? EMPTY_CLIP);
    const [ volume, setVolume ] = useState<number>(editClip ? editClip.volume : EMPTY_CLIP.volume);
    const [ isPlaying, setIsPlaying ] = useState<boolean>(false);

    const allTags = useSelector((state: RootState) => state.soundboard.allTags);
    const addApiState: apiState = useSelector((state: RootState) => state.soundboard.clipAddState);
    const editApiState: apiState = useSelector((state: RootState) => state.soundboard.clipEditState);

    const toggleClipAudio = (e: React.MouseEvent<any, any>) => {
        e.stopPropagation();
        if (isPlaying) {
            audioFile.current?.pause();
            setIsPlaying(false);
        } else {
            audioFile.current?.play();
            setIsPlaying(true);
        }
    }

    const validAudioSource = (): boolean => {
        let audioIsValid: boolean = true;
        if (!clipData.url) audioIsValid = false;
        audioIsValid = /^(https?):\/\/(www.)?(.*?)\.(mp3|ogg|wav)$/gi.test(clipData.url);

        return audioIsValid;
    }

    useEffect(() => {
        if (editClip) {
            setClipData(editClip);
            setTags(editClip.tags);
            setIsPlaying(false);
        } else {
            setClipData(EMPTY_CLIP);
            setTags([]);
        }
    }, [editClip]);

    useEffect(() => {
        if (clipData.url && !validAudioSource()) {
            toastr.error('Invalid audio source. This url does not appear to be a direct link to an .mp3, .ogg, or .wav file.');
        }
    }, [clipData.url]);

    useEffect(() => {
        if (audioFile.current) audioFile.current.volume = volume / 100;
    }, [volume]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setClipData({
            ...clipData,
            [name]: value,
        });
    };

    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        setClipData({ ...clipData, volume: newValue as number });
    }

    const handleSave = () => {
        if (!editClip || (editClip && editClip.isSavingMyInstant)) {
            setSubmitted('add');
        } else {
            setSubmitted('edit');
        }
        
        onSave({ ...clipData, tags });
    };

    const _close = () => {
        onClose();
        setSubmitted(null);
        setClipData(EMPTY_CLIP);
        setTags([]);
    }

    useEffect(() => {
        if (submitted) {
            if ((submitted === 'add' && addApiState === 'fulfilled') ||
                (submitted === 'edit' && editApiState === 'fulfilled')) {
                _close();
            } else if ((submitted === 'add' && addApiState === 'rejected') ||
                (submitted === 'edit' && editApiState === 'rejected')) {
                toastr.error(`Failed to ${submitted === 'add' ? 'add' : 'edit'} clip`);
                _close();
            }
        }
    }, [submitted, addApiState, editApiState]);

    const tagOptions = React.useMemo(() => {
        // Generate tag options for the autocomplete
        // This will return an array of objects with title for display and inputValue for custom input
        return allTags.filter((tag) => {
            return !clipData.tags.includes(tag)
        }).map((tag: string) => ({
            title: tag,
        }));
    }, [allTags, clipData.tags]);

    // const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (event.key === 'Enter' && tagInput.trim() !== '' && !tags.includes(tagInput)) {
    //         setTags([...tags, tagInput.trim()]);
    //         setTagInput('');
    //     }
    // };

    const handleDeleteTag = (tagToDelete: string) => () => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{`${editClip && !editClip.isSavingMyInstant ? 'Edit' : 'Add New'} Clip`}</DialogTitle>
            <DialogContent>
                {/* <InputLabel id="clip-type-label">Clip Type</InputLabel> */}
                {/* <FormControl fullWidth margin="normal">
                    <Select labelId="clip-type-label" value={clipType} onChange={handleClipTypeChange}>
                        <MenuItem value="local" disabled>Local File - Coming Soon</MenuItem>
                        <MenuItem value="url">URL</MenuItem>
                    </Select>
                </FormControl> */}
                <FormControl className='clip-details' fullWidth margin='normal'>
                    <TextField
                        fullWidth
                        label="URL"
                        name="url"
                        value={clipData.url}
                        onChange={handleInputChange}
                        error={clipData.url !== "" && !validAudioSource()}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={clipData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={clipData.description}
                        onChange={handleInputChange}
                    />
                    <Select
                        labelId="category"
                        id="category"
                        name="category"
                        value={clipData.category ?? ClipCategory.UNCATEGORIZED}
                        onChange={handleInputChange}
                        label="Category"
                    >
                        {Object.values(ClipCategory).map((category: ClipCategory, i: number) => {
                            return (
                                <MenuItem key={i} value={category}>{category}</MenuItem>
                            )
                        })}
                    </Select>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        selectOnFocus={true}
                        clearOnBlur={true}
                        autoHighlight={true}
                        value={tagInput}
                        options={tagOptions}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                    
                            const { inputValue } = params;
                            // Suggest the creation of a new value
                            const isExisting = options.some((option) => inputValue === option.title);
                            if (inputValue !== '' && !isExisting) {
                              filtered.unshift({
                                title: `Add tag: ${inputValue}`, // Display value
                                inputValue,
                              });
                            }
                    
                            return filtered;
                        }}
                        onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => { if (event) setTagInput({ title: event.target?.value }) }}
                        onChange={(event, newValue) => {
                            if (typeof newValue === 'string') {
                                setTags([ ...tags, newValue ]);
                            //@ts-expect-error
                            } else if (newValue && newValue.inputValue) {
                                //@ts-expect-error
                                setTags([ ...tags, newValue.inputValue ]);
                            } else if (newValue && newValue.title) {
                                setTags([ ...tags, newValue.title ]);
                            }

                            setTagInput({ title: '' });
                        }}
                        onBlur={(e) => {
                            setTagInput({ title: '' });
                        }}
                        getOptionLabel={(option) => {
                            // Determine the label to display for the option
                            // This will be used to display in the input
                            if (typeof option === 'string') {
                                return option;
                            } 
                            //@ts-expect-error
                            if (option.inputValue) {
                                return option.title; // For custom input
                            }
                            return option.title; // For existing options
                        }}
                        renderInput={(params) => 
                            <TextField
                                {...params}
                                label="Tags"
                                helperText="Press Enter to add tag"
                            />
                        }
                    />
                    <div>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                onDelete={handleDeleteTag(tag)}
                                style={{ margin: '2px' }}
                            />
                        ))}
                    </div>
                    <div className='volume-controls'>
                        {isPlaying ? <ClipActionButton onClick={toggleClipAudio} title='Play' Icon={Pause} /> : 
                            <ClipActionButton disabled={!validAudioSource()} onClick={toggleClipAudio} title='Play' Icon={PlayArrow} />}
                        <Stack className='volume-slider' spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                            <VolumeDown />
                                <Slider disabled={!validAudioSource()} aria-label="Volume" value={volume} onChange={(e: Event, newValue: number | number[]) => setVolume(newValue as number)} onChangeCommitted={handleVolumeChange} />
                            <VolumeUp />
                        </Stack>   
                    </div>
                    {open && validAudioSource() && <audio preload='metadata' className='clip-audio' ref={audioFile} src={clipData.url} onEnded={() => {
                        setIsPlaying(false) 
                        if (audioFile.current) audioFile.current.currentTime = 0;
                    }} />}
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Stack direction="row" spacing={2}>
                    <Button
                        loading={addApiState === 'pending' || editApiState === 'pending'}
                        loadingPosition="end"
                        onClick={handleSave}
                        startIcon={<Save />}
                    >
                        {editClip && !editClip.isSavingMyInstant ? 'Save' : 'Add Clip'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigClipDialog;