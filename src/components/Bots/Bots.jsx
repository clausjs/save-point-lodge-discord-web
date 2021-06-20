import React, { useState } from 'react';

import {
    CssBaseline,
    Snackbar,
    GridList,
    GridListTile,
    GridListTileBar
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import MuiAlert from '@material-ui/lab/Alert';

import '../../sass/bots.scss';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: 'inherit',
    },
    gridList: {
      flexWrap: 'nowrap',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    title: {
      color: '#1C364A',
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(242,100,25,1) 0%, rgba(242,100,25,0.5) 70%, rgba(242,100,25,0) 100%)',
    },
  }));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Bots = () => {
    const classes = useStyles();
    const [ open, setOpen ] = useState(true);

    const handleClose = () => {
        setOpen(false);
    }

    const tileData = [
        {
            img: '/img/dankmemer.png',
            title: 'Dank Memer',
            url: 'https://dankmemer.lol/'
        },
        {
            img: '/img/bbbot.png',
            title: 'B**b Bot',
            url: 'https://boobbot.us/'
        },
        {
            img: '/img/rythm.jpeg',
            title: 'Rythm.fm Bot',
            url: 'https://rythm.fm/'
        }
    ];

    return (
        <div className="content">
            <React.Fragment>
                <CssBaseline />
                <Snackbar open={open} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="info">
                        As the development and ongoing maintenance take time and the hosting space incurs costs the creators always appreciate a <a href="https://www.buymeacoffee.com/joebot">coffee</a>.
                    </Alert>
                </Snackbar>
                <img id='bots-header' src='/img/bots.jpg' />
                <h1>Created at Save Point Lodge</h1>
                <h2>Joe_Bot</h2>
                <div className='about-joe-bot'>
                    <p>
                        Our channels are patrolled by the abrasive but very helpful Joe_Bot, a creation of the server owner, 
                        ice2morrow. It is programmed to streamline your experience, allowing you to choose which channel groups 
                        to display, toggle auto-reactions, or even create new channels for the game you are playing!
                    </p>
                    <img src="/img/joebot_youtube.png" />
                    <p>
                        Since Save Point Lodge staff has direct access to the bot's inner workings (the code) we also want to hear feedback about him.
                        Did he say something you don't like? Are his tools difficult to use? Let us know in the feedback channel or by talking to our staff!
                    </p>
                    <img src="/img/joebot_urband.png" />
                </div>
                <h1>Third Party Bots</h1>
                <div className={`${classes.root} third-party-bots`}>
                    <GridList className={classes.gridList} cols={2.5}>
                        {tileData.map((tile, i) => (
                            <a key={i} href={tile.url}>
                                <GridListTile key={tile.img}>
                                    <img src={tile.img} alt={tile.title} />
                                    <GridListTileBar
                                    title={tile.title}
                                    classes={{
                                        root: classes.titleBar,
                                        title: classes.title,
                                    }}
                                    />
                                </GridListTile>
                            </a>
                        ))}
                    </GridList>
                </div>
            </React.Fragment>
        </div>
    );
}

export default Bots;