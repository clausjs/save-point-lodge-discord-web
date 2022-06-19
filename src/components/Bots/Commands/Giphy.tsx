import React, { useState, SyntheticEvent } from 'react';
import { Grid } from '@giphy/react-components'
import { GifsResult } from '@giphy/js-fetch-api';
import { Box, LinearProgress, Popper, Fade } from '@material-ui/core';
import fetch from 'node-fetch';

import '../../../sass/commands.scss';

const GiphyExamples: React.FC = () => {
    const [ anchorEl, setAnchorEl ] = useState(null);

    const generateExampleGifs = async (offset: number): Promise<GifsResult> => {
        return new Promise(async (resolve, reject) => {
            fetch(`/api/giphy?${new URLSearchParams({ offset: ""+offset })}`).then(res => res.json()).then(data => {
                resolve(data);
            });
        });
    }

    const gifSelected = (gif: any, e: SyntheticEvent<HTMLElement, Event>) => {
        e.preventDefault();
        if (gif.animated_text_style) {
            setAnchorEl(anchorEl ? null : e.target);
            navigator.clipboard.writeText(gif.animated_text_style);
        }

        setTimeout(() => {
            setAnchorEl(null);
        }, 2000);
    }

    const open = Boolean(anchorEl);

    return (
        <div className='giphy-grid'>
            <Popper id={'font-style-copied'} anchorEl={anchorEl} open={open} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Box style={{ border: 1, backgroundColor: 'black', color: 'white' }}>
                            Font style copied to clipboard.
                        </Box>
                    </Fade>
                )}
            </Popper>
            <Grid 
                width={800} 
                columns={4} 
                gutter={3} 
                key={'example text'} 
                fetchGifs={generateExampleGifs}
                onGifClick={gifSelected}
            />
        </div>
    );
}

export default GiphyExamples;