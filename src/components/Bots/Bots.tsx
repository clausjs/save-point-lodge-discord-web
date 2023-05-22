import React from 'react';

import {
    Divider,
    Container,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Avatar,
    Grid
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import '../../sass/bots.scss';

type BotInfo = {
    name: string;
    image: string;
    url: string;
    description?: string;
}

const tpBots: BotInfo[] = [
    {
        name: "Dank Memer",
        image: "/img/dankmemer.png",
        url: "https://dankmemer.lol/",
        description: "Dank Memer patrols our meme channels to provide quick access to the internets most valuable contribution"
    },
    {
        name: "Apollo",
        image: "/img/apollo.png",
        url: "https://apollo.fyi/",
        description: "Apollo is a bot that allows you to create events and invite users. It can even create external calendar invites so everyone can plan accordingly for events they agree to!"
    },
    {
        name: "Pachimari",
        image: "/img/pachimari.png",
        url: "https://acupoftee.github.io/Pachimari-Dashboard/",
        description: "Gets the latest news and real time stats for Overwatch League and Overwatch Contenders!"
    }
];

const Bots: React.FC = () => {
    return (
        <Container className='bots-content' maxWidth={false} disableGutters>
            <Container className='text-flair'>
                <div className='top'></div>
                <div className='bottom'></div>
            </Container>
            <Container className='joebot-profile heading'>
                <h1>Created in house @ Save Point Lodge</h1>
                <div className='joebot-profile bot-item'>
                    <div className='bot-item-content'>
                        <Avatar src='/img/joebot/joebot.png' className='bot-avatar' />
                        <div className='bot-info'>
                            <span className='bot-name'>Joe_Bot</span>
                            <span className='bot-site'><a href='/commands'>Looking for Joe_Bot commands? Click Here!</a></span>
                        </div>
                    </div>
                </div>
            </Container>
            <Container className='joebot-description'>
                <Grid container className='search-info' spacing={5}>
                    <Grid lg>
                        <p>
                            Joe_Bot is a versatile and entertaining addition to Save Point Lodge. Built by the server owner, with its ability to search popular services like YouTube, 
                            Spotify, UrbanDictionary, Wikipedia, and IMDb, it can provide helpful and interesting information to members of the server in any chat. 
                            Whether someone needs to look up a song or find the meaning of a word, the bot can quickly and easily provide answers.
                        </p>
                    </Grid>
                    <Grid sm className='image-example'>
                        <img src='/img/joebot/slash-command-entry-example.gif' />
                    </Grid>
                </Grid>
                <Grid container className='trigger-info' spacing={5}>
                    <Grid sm className='image-example'>
                        <img src='/img/joebot/joebot-responses-example.gif' />
                    </Grid>
                    <Grid lg>
                        <p>
                            But Joe_Bot is more than just a search tool - he has a snarky personality that adds a fun and unique element to the server. With clever and amusing text triggers, 
                            the bot can keep members engaged and entertained. Whether someone is looking for a laugh or just wants to see what the bot will say next, they're sure 
                            to be entertained. 
                        </p>
                    </Grid>
                </Grid>
                <Grid container className='trending-games-info'>
                    <Grid lg>
                        <p>
                            One of the most useful features of the bot is its system for creating channels for trending games. When a new game becomes popular, 
                            users can use Joe_Bot to create a channel for it<sup>*</sup>. These channels have a set lifespan before they "retire", but can be unretired at any time if the game 
                            regains popularity. This allows the server to stay current and relevant with the latest gaming trends, without cluttering up the UI with unused channels.
                            
                            <p className='create-terms'>
                                <sup>*</sup> Discord Activity must be enabled to create channels
                            </p>
                        </p>
                    </Grid>
                    <Grid sm className='image-example'>
                        <img src='/img/joebot/trending-games-example.gif' />
                    </Grid>
                </Grid>
                <Grid container className='spl-control-info'>
                    <Grid sm className='image-example'>
                        <img src='/img/code-example.png' />
                    </Grid>
                    {/* <Grid lg>
                        <p>
                            Since Save Point Lodge staff has direct access to the bot's inner workings (the code) we also want to hear feedback about him. Did he say something you don't like? 
                            Are his tools difficult to use? Let us know in the feedback channel or by talking to our staff!
                        </p>
                    </Grid> */}
                </Grid>
            </Container>
            <Container className='third-party' maxWidth={false} disableGutters>
                <Container maxWidth={'xl'}>
                    <h2>Save Point Lodge also uses these third party bots</h2>
                </Container>
                <Container className='bot-list' maxWidth={'xl'}>
                    {tpBots.map((botInfo: BotInfo, i: number) => {
                        const openUrl = () => window.open(botInfo.url, '_blank');

                        return (
                            <Container className='bot-item'>
                                <div className='bot-item-content'>
                                    <Avatar alt={`${botInfo.name}-icon`} src={botInfo.image} className='bot-avatar' />
                                    <div className='bot-info'>
                                        <span className='bot-name'>{botInfo.name}</span>
                                        <span className='bot-site'><a target="_blank" href={botInfo.url}>{botInfo.url}</a></span>
                                    </div>
                                </div>
                            </Container>
                        )
                    })}
                </Container>
            </Container>
        </Container>
    );
}

export default Bots;