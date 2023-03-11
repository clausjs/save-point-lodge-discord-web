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
    ListItemText
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
        <div className='bots-content'>
            <div className='about'>
                <Container className='joebot-description'>
                    <div className='text-flair'>
                        <div className='top'></div>
                        <div className='bottom'></div>
                    </div>
                    <div className="heading main" id='in-house-heading'><h1>Created at Save Point Lodge</h1></div>
                    <div className="heading" id='joebot-heading'>
                        <h2>Joe_Bot</h2>
                        <a href='/commands'><span className='subtext'>Looking for Joe_Bot commands? Click Here!</span></a>
                    </div>
                    <div className="subtitle" id='line1'>
                        Joe_Bot is a versatile and entertaining addition to Save Point Lodge. Built by the server owner, with its ability to search popular services like YouTube, 
                        Spotify, UrbanDictionary, Wikipedia, and IMDb, it can provide helpful and interesting information to members of the server in any chat. 
                        Whether someone needs to look up a song or find the meaning of a word, the bot can quickly and easily provide answers.
                    </div>
                    <div className="subtitle" id='line2'>
                        But Joe_Bot is more than just a search tool - he has a snarky personality that adds a fun and unique element to the server. With clever and amusing text triggers, 
                        the bot can keep members engaged and entertained. Whether someone is looking for a laugh or just wants to see what the bot will say next, they're sure 
                        to be entertained. 
                    </div>
                    <div className="subtitle" id='line3'>
                        One of the most useful features of the bot is its system for creating channels for trending games. When a new game becomes popular, 
                        users can use Joe_Bot to create a channel for it. These channels have a set lifespan before they "retire", but can be unretired at any time if the game 
                        regains popularity. This allows the server to stay current and relevant with the latest gaming trends, without cluttering up the UI with unused channels.
                    </div>
                    <div className="subtitle" id='line4'>
                        Since Save Point Lodge staff has direct access to the bot's inner workings (the code) we also want to hear feedback about him. Did he say something you don't like? 
                        Are his tools difficult to use? Let us know in the feedback channel or by talking to our staff!
                    </div>
                    {/* <a className="bmac-button" href="https://www.buymeacoffee.com/joebot" target="_blank">
                        <img id='bmac' src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" />
                    </a> */}
                </Container>
                <Container className='discord-example' maxWidth='md'>
                    <div className='image-container'>
                        <div className='image-flair'>
                            <div className='top'></div>
                            <div className='bottom'></div>
                        </div>
                        <img src='/img/joebot/slash-command-entry.gif' />
                    </div>
                </Container>
            </div>
            <div className='third-party'>
                <h2>Save Point Lodge also uses these third party bots</h2>
                <div className='bot-cards'>
                    {tpBots.map((botInfo: BotInfo, i: number) => {
                        const openUrl = () => window.open(botInfo.url, '_blank');

                        return (
                            <Card style={{ maxWidth: 300, height: 400 }} className='bot-card' key={i} onClick={openUrl}>
                                <CardActionArea>
                                    <CardMedia
                                        component='img'
                                        height="250"
                                        image={botInfo.image}
                                        alt={`${botInfo.name} icon`}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {botInfo.name}
                                        </Typography>
                                        <Typography variant="body2">
                                            {botInfo.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Bots;