import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    TextField, MenuItem, Select, FormControl, InputLabel, Chip, 
    SelectChangeEvent
} from '@mui/material';

interface AddClipProps {
    open: boolean;
    onClose: () => void;
    onSave: (clip: any) => void;
}

const AddClipDialog: React.FC<AddClipProps> = ({ open, onClose, onSave }) => {
    const [clipType, setClipType] = useState<'local' | 'url'>('url');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [clipData, setClipData] = useState({
        name: '',
        description: '',
        file: null as File | null,
        url: '',
    });

    const handleClipTypeChange = (event: SelectChangeEvent) => {
        setClipType(event.target.value as 'local' | 'url');
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = event.target;
        setClipData({
            ...clipData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSave = () => {
        onSave(clipData);
        onClose();
    };

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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Clip</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Clip Type</InputLabel>
                    <Select placeholder='Select clip type' value={clipType} onChange={handleClipTypeChange}>
                        <MenuItem value="local">Local File</MenuItem>
                        <MenuItem value="url">URL</MenuItem>
                    </Select>
                </FormControl>
                {clipType === 'local' ? (
                    <TextField
                        fullWidth
                        margin="normal"
                        type="file"
                        name="file"
                        onChange={handleInputChange}
                    />
                ) : (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="URL"
                        name="url"
                        value={clipData.url}
                        onChange={handleInputChange}
                    />
                )}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Name"
                    name="name"
                    value={clipData.name}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    name="description"
                    value={clipData.description}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} color="primary">Add Clip</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddClipDialog;