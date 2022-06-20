import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Grid } from '@giphy/react-components'
import { GifsResult } from '@giphy/js-fetch-api';
import { AnimatedIGif } from '../../../types';
import { OutlinedInput, IconButton, Box, Popper, Fade, TextField, InputAdornment } from '@material-ui/core';
import ArrowForwardIosOutlined from '@material-ui/icons/ArrowForwardIosOutlined';
import fetch from 'node-fetch';

import '../../../sass/commands.scss';

interface GiphyGridParams {
    text?: string;
    gifSelected: (gif: AnimatedIGif, e: SyntheticEvent<HTMLElement, Event>) => void;
}

const GiphyGrid: React.FC<GiphyGridParams> = (props: GiphyGridParams) => {
    return (
        <Grid 
            width={800} 
            columns={4} 
            gutter={3} 
            key={props.text} 
            fetchGifs={(offset: number) => {
                return new Promise(async (resolve, reject) => {
                    const params: {offset: string, text?: string} = { offset: `${offset}` };
                    if (props.text) params.text = props.text;

                    fetch(`/api/giphy?${new URLSearchParams(params)}`).then(res => res.json()).then(data => {
                        resolve(data);
                    });
                });
            }}
            onGifClick={props.gifSelected}
        />
    );
}

const GiphyExamples: React.FC = () => {
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ lastSelected, setLastSelected ] = useState<string | null>(null);
    const [ searchText, setSearchText ] = useState<string | null>(null);
    const [ textField, setTextField ] = useState<string>("");
    
    const gifSelected = (gif: AnimatedIGif, e: SyntheticEvent<HTMLElement, Event>) => {
        e.preventDefault();
        if (gif.animated_text_style) {
            setLastSelected(gif.animated_text_style);
            navigator.clipboard.writeText(gif.animated_text_style);
            setAnchorEl(anchorEl ? null : e.target);
        }
        
        setTimeout(() => {
            setAnchorEl(null);
            setLastSelected(null);
        }, 2000);
    }

    const submitSearch = () => {
        console.log("submitting search");
        setSearchText(textField);
    }

    const open = Boolean(anchorEl);

    return (
        <div className='giphy-grid'>
            <Popper id={'font-style-copied'} anchorEl={anchorEl} open={open} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Box style={{ border: 1, backgroundColor: 'black', color: 'white' }}>
                            {`Font style '${lastSelected}' copied to clipboard.`}
                        </Box>
                    </Fade>
                )}
            </Popper>
            <OutlinedInput
                id='giphy-creation-text'
                value={textField}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTextField(event.target.value)}
                endAdornment={<InputAdornment position='end'><IconButton onClick={submitSearch}><ArrowForwardIosOutlined /></IconButton></InputAdornment>}
            />
            <GiphyGrid
                text={searchText}
                gifSelected={gifSelected}
            />
        </div>
    );
}

export default GiphyExamples;