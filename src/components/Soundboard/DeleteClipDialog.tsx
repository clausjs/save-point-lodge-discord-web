import React, { useEffect } from 'react';

import { Button, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { Clip } from "../../types";
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { Delete } from '@mui/icons-material';

import './ConfigClipDialog.scss';

interface DeleteClipDialogProps {
    open: boolean;
    clip?: Clip;
    onClose: () => void;
    onDelete: (clipId: string) => void;
}

const DeleteClipDialog: React.FC<DeleteClipDialogProps> = ({ open, onClose, onDelete, clip }) => {
    const deleteApiState = useSelector((state: RootState) => state.soundboard.clipDeleteState);

    useEffect(() => {
        if (deleteApiState === 'fulfilled') {
            onClose();
        }
    }, [deleteApiState]);

    return (
        <Dialog className='delete-dialog' open={open} onClose={onClose} fullWidth>
            <DialogTitle>Are you sure you want to delete this clip?</DialogTitle>
            <DialogContent>
                <span>{`This will permenantly remove ${clip?.name} and all of its metadata. Are you sure you want to proceed?`}</span>
                <div className='actions'>
                    <Button onClick={onClose}>Cancel</Button>
                    <Stack direction="row" spacing={2}>
                        <Button
                            loading={deleteApiState === 'pending'}
                            loadingPosition="end"
                            onClick={() => onDelete(clip?.id)}
                            startIcon={<Delete />}
                            color='error'
                        >
                            Delete
                        </Button>
                    </Stack>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteClipDialog;