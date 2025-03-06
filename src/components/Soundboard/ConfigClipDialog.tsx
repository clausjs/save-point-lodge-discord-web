import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    TextField, MenuItem, Select, FormControl, InputLabel, Chip, 
    SelectChangeEvent,
    Stack
} from '@mui/material';
import { apiState, Clip } from '../../types';
import { Save } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import toastr from '../../utils/toastr';

import './ConfigClipDialog.scss';

interface ConfigClipDialogProps {
    clip?: Clip;
    open: boolean;
    onClose: () => void;
    onSave: (clip: any) => void;
}

const EMPTY_CLIP: Clip = {
    id: '',
    name: '',
    description: '',
    url: '',
    uploadedBy: '',
    tags: [],
    playCount: 0
}

const ConfigClipDialog: React.FC<ConfigClipDialogProps> = ({ clip: editClip, open, onClose, onSave }) => {
    const [ submitted, setSubmitted ] = useState<'add' | 'edit' | null>(null);
    const [clipType, setClipType] = useState<'local' | 'url'>('url');
    const [tags, setTags] = useState<string[]>(editClip ? editClip.tags : []);
    const [tagInput, setTagInput] = useState('');
    const [clipData, setClipData] = useState<Clip>(editClip ?? EMPTY_CLIP);

    const addApiState: apiState = useSelector((state: RootState) => state.soundboard.clipAddState);
    const editApiState: apiState = useSelector((state: RootState) => state.soundboard.clipEditState);

    useEffect(() => {
        if (editClip) {
            setClipData(editClip);
            setTags(editClip.tags);
        } else {
            setClipData(EMPTY_CLIP);
            setTags([]);
        }
    }, [editClip]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = event.target;
        setClipData({
            ...clipData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSave = () => {
        setSubmitted(editClip ? 'edit' : 'add');
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

    const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && tagInput.trim() !== '' && !tags.includes(tagInput)) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete: string) => () => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{`${editClip ? 'Edit' : 'Add New'} Clip`}</DialogTitle>
            <DialogContent>
                {/* <InputLabel id="clip-type-label">Clip Type</InputLabel> */}
                {/* <FormControl fullWidth margin="normal">
                    <Select labelId="clip-type-label" value={clipType} onChange={handleClipTypeChange}>
                        <MenuItem value="local" disabled>Local File - Coming Soon</MenuItem>
                        <MenuItem value="url">URL</MenuItem>
                    </Select>
                </FormControl> */}
                <div className='clip-details'>
                    {clipType === 'local' ? (
                        <TextField
                            fullWidth
                            type="file"
                            name="file"
                            onChange={handleInputChange}
                        />
                    ) : (
                        <TextField
                            fullWidth
                            label="URL"
                            name="url"
                            value={clipData.url}
                            onChange={handleInputChange}
                            required
                        />
                    )}
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
                    <TextField
                        fullWidth
                        label="Tags"
                        value={tagInput}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTagInput(event.target.value)}
                        onKeyDown={handleTagKeyDown}
                        helperText="Press Enter to add a tag"
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
                </div>
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
                        {editClip ? 'Save' : 'Add Clip'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigClipDialog;