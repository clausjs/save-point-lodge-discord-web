import React from 'react';

import {
    CssBaseline,
    Container
} from '@material-ui/core';

import '../../sass/bots.scss';

const Bots = () => {
    return (
        <React.Fragment>
            <CssBaseline />
            <Container>
                <div className='content'>
                    <h1>Created by Save Point Lodge</h1>
                    <h2>Joe_Bot</h2>

                    <p>
                        Our channels are patrolled by the abrasive but very helpful Joe_Bot, a creation of the server owner, 
                        ice2morrow. It is programmed to streamline your experience, allowing you to choose which channel groups 
                        to display, toggle auto-reactions, or even create new channels for the game you are playing!
                    </p>

                    <p>
                        Since Save Point Lodge staff has direct access to the bot's inner workings (the code) we also want to hear feedback about him.
                        Did he say something you don't like? Are his tools difficult to use? Let us know in the feedback channel or by talking to our staff!
                    </p>

                    <p>
                        As the development and ongoing maintenance take time and the hosting space incurs costs the creators always appreciate a <a href="https://www.buymeacoffee.com/joebot"><strike>coffee</strike> beer</a>.
                    </p>

                    <h1>Third Party Bots</h1>
                    <ul className="third-party-list">
                        <li><a href="https://dankmemer.lol/">Dank Memer</a> - Available in our meme channels</li>
                        <li><a href="https://boobbot.us/">**** Bot</a> <span className='subtext'>(Bot name contains NSFW terminology)</span> - Available in adult oriented (NSFW) channels</li>
                        <li><a href="https://rythm.fm/">Rythm Bot</a> - Available in a music channel and a voice channel for group listening</li>
                    </ul>
                </div>
            </Container>
        </React.Fragment>
    );
}

export default Bots;