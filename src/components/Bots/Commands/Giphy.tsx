import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Grid } from '@giphy/react-components'
import fetch from 'node-fetch';

import { 
    OutlinedInput, 
    IconButton, 
    Box, 
    Popper, 
    Fade, 
    InputAdornment, 
    FormControl 
} from '@mui/material';

import { AnimatedIGif } from '../../../types';

import './Commands.scss';
import { SearchOutlined } from '@mui/icons-material';

interface GiphyGridParams {
    text?: string;
    gifSelected: (gif: AnimatedIGif, e: SyntheticEvent<HTMLElement, Event>) => void;
}

interface PoweredByGiphyParams {
    className?: string;
}

const calculateColumnsAndGutter = (width: number): { columns: number, gutter: number } => {

    let newColumns: number;
    let newGutter: number;
    const response: { columns: number, gutter: number } = {
        columns: 6,
        gutter: 5
    };

    if (width > 1920) {
        newColumns = 6;
        newGutter = 5;
    } else if (width < 1920 && width > 1000) {
        newColumns = 4;
        newGutter = 3;
    } else if (width < 1000 && width > 800) {
        newColumns = 2;
        newGutter = 1;
    } else {
        newColumns = 1;
        newGutter = 1;
    }

    response.columns = newColumns;
    response.gutter = newGutter;

    return response;
}

const PoweredByGiphy = ({
    className
}: PoweredByGiphyParams) => {
    return <img className={className || ""} src="/img/giphy.gif" />
}

const GiphyGrid: React.FC<GiphyGridParams> = (props: GiphyGridParams) => {
    const [ width, setWidth ] = useState<number>(window.innerWidth);
    const columnsAndGutter = calculateColumnsAndGutter(window.innerWidth);
    const [ columns, setColumns ] = useState<number>(columnsAndGutter.columns);
    const [ gutter, setGutter ] = useState<number>(columnsAndGutter.gutter);
    const { text, gifSelected } = props;

    const handleResize = () => {
        const newWidth: number = window.innerWidth;

        setWidth(newWidth);
        const columnsAndGutter = calculateColumnsAndGutter(newWidth);

        setColumns(columnsAndGutter.columns);
        setGutter(columnsAndGutter.gutter);
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);
    })

    return (
        <Grid 
            width={width} 
            columns={columns} 
            gutter={gutter} 
            key={text} 
            fetchGifs={(offset: number) => {
                return new Promise(async (resolve, reject) => {
                    const params: {offset: string, text?: string} = { offset: `${offset}` };
                    if (text) params.text = text;

                    fetch(`/api/giphy?${new URLSearchParams(params)}`).then(res => res.json()).then(data => {
                        resolve(data);
                    });
                });
            }}
            onGifClick={gifSelected}
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
        setSearchText(textField);
    }

    const keyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.code === "Enter") submitSearch();
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
            <div className='search-content'>
                <div className='search'>
                    <FormControl variant='outlined'>
                        <OutlinedInput
                            id='outlined-adornment'
                            className='giphy-creation-text'
                            value={textField}
                            placeholder="Test gif generation here..."
                            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTextField(event.target.value)}
                            onKeyDown={keyDown}
                            endAdornment={<InputAdornment className='textfield-end-adornment' position='end'><IconButton onClick={submitSearch}><SearchOutlined /></IconButton></InputAdornment>}
                        />
                    </FormControl>
                    <span className='instructions'>Click any gif to copy the name of the font style to your clipboard.</span>
                </div>
            </div>
            <GiphyGrid
                text={searchText}
                gifSelected={gifSelected}
            />
            <PoweredByGiphy />
        </div>
    );
}

export default GiphyExamples;