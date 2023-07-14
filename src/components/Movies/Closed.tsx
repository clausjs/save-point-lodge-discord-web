import React from 'react';
import { connect } from 'react-redux';

import {
    Container,
    Grid,
    Typography,
} from '@material-ui/core';

import '../../sass/no-movies.scss';

const NoMovies: React.FC = () => {
    return (
        <Container className='theater-closed' maxWidth={false} disableGutters>
            <Container className='closed-message' maxWidth='md'>
                <Container className='message-content'>
                    <Typography component='h1' className='quote'>“Saying goodbye doesn't mean anything. It's the time we spent together that matters, not how we left it.”</Typography>
                    <h2>Sorry, the theater is closed</h2>
                    <p>
                        Unfortunately, the theater is currently closed. The time and effort required to maintain the 
                        theater, security certificates, server costs, and cloud storage are too much for how little patronage the
                        theater sees these days. Many SPLers are busy with work, family, and life in general and don't have the time 
                        to gather for a movie night. 
                    </p>
                    <h4>We hope in the future we'll have more news to share. For now though, its been a good run.</h4>
                    <span className='signature'>- The SPL Staff</span>
                </Container>
            </Container>
        </Container>
    );
}

export default connect()(NoMovies);

