import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
    CssBaseline,
    Container
} from '@material-ui/core';

import '../../sass/home.scss';

const useStyles = makeStyles({
    root: {
      width: '100%',
      maxWidth: 500,
    },
  });

const Home = (props) => {
    const classes = useStyles();

    return (
        <div className="home-content">
            <div className={classes.root}></div>
            <React.Fragment>
                <CssBaseline />
                <Container maxWidth="md">
                    <div className="header">
                        <h1><span>WELCOME TO SAVE POINT LODGE</span></h1>
                        <img id='home_bg' src="img/home_bg.png" />
                    </div>
                    <div className="about-us">
                        <p>
                            Save Point Lodge (or SPL) started in 2016 as a communal space on the internet to share a 
                            love of gaming and built around the ideals of inclusivity, respect, and accessibility.
                        </p>

                        <p>
                            The server began when a group of strangers who met through Overwatch created a space for all to
                            seek 'shelter from the storm'. To feel included. To have a beer. To play some games. There is still an active player base
                            in many games, including Apex Legends, Diablo 3, and Sid Meier’s Civilization, as well as 
                            plenty of channels for discussion of non-gaming subjects, like movies, music, and DIY projects.
                        </p>

                        <p>
                            The lodge operates on behalf of, and with contribution from, its own members and staff. 
                            Throughout our existence, we’ve made changes based on member feedback and testing. The staff are 
                            always looking to hear from you on what could change to make your experience even better.
                        </p>

                        <h3>Our Promise</h3>
                        <span className='promise'>This is a 'Save Point'; as such no goblins, Lich Kings, or Walls of Death can harm you here. Our doors are open
                            to weary travelers but this space will be kept safe.</span>
                        
                        <div className="invite">
                            <h3>Join us on Discord!</h3>
                            <iframe src="https://discord.com/widget?id=184535415363993600&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>

                            {/* <p className='links'><a href="https://discord.gg/kZZGSU3">Join us on Discord!</a></p> */}
                        </div>

                        <p className="links">If you're already a member,&nbsp;<a href="/login">sign in</a>&nbsp;above to configure user specific items to Save Point Lodge!</p>
                    </div>
                </Container>
            </React.Fragment>
        </div>
    );
};

export default Home;