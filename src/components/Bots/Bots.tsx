import React from 'react';

import {
    Divider,
    Container,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import '../../sass/bots.scss';

const useStyles = makeStyles({
    root: {
        flexGrow: 1
    },
    cardRoot: {
        maxWidth: 345,
        justifyContent: 'center',
    },
    button: {
        display: 'flex !important',
        cursor: 'not-allowed',
        pointerEvents: 'auto'
    },
    media: {
        height: 140
    }
});

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
        description: "Apollo is a bot that allows you to create events and invite users. It can even create external calendar invites so everyone can plan accordingly for events they agree to! It's easy to use and has a lot of features."
    },
    {
        name: "Pachimari",
        image: "/img/pachimari.png",
        url: "https://acupoftee.github.io/Pachimari-Dashboard/",
        description: "Gets the latest news and real time stats for Overwatch League and Overwatch Contenders!"
    }
];

const Bots: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={`${classes.root} bots-content`}>
            <div className='about'>
                <Container className='joebot-description' maxWidth='md'>
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
                        Our channels are patrolled by the abrasive but very helpful Joe_Bot, a creation of the server owner, 
                        ice2morrow. It is programmed to streamline your experience, allowing you to choose which channel groups 
                        to display, toggle auto-reactions, or even create new channels for the game you are playing!
                    </div>
                    <div className="subtitle" id='line2'>
                        Since Save Point Lodge staff has direct access to the bot's inner workings (the code) we also want to hear feedback about him.
                        Did he say something you don't like? Are his tools difficult to use? Let us know in the feedback channel or by talking to our staff!
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
                <List className='bot-list' component='nav'>
                    <Divider className='divider' />
                    {tpBots.map((botInfo: BotInfo, i: number) => {
                        const openUrl = () => window.open(botInfo.url, '_blank');

                        return (
                            <>
                                <ListItem button className='bot-list-item' key={i} onClick={openUrl}>
                                    <ListItemAvatar className='bot-list-image'>
                                        <img src={botInfo.image} />
                                    </ListItemAvatar>
                                    <ListItemText primary={<h4>{botInfo.name}</h4>} secondary={<p>{botInfo.description}</p>} disableTypography={true} ></ListItemText>
                                </ListItem>
                                <Divider className='divider' />
                            </>
                        );
                    })}
                </List>
            </div>
        </div>
    );
}

export default Bots;