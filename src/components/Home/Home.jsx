import React from 'react';

import {
    Button,
    Container,
} from '@material-ui/core';

import '../../sass/home.scss';

const Home = (props) => {
    return (
        <div className="home-content">
            <div className="main-header">
                <div className="logo">
                    <img src="/img/logo.png" />
                </div>
                <div className="heading">
                    <h1>SAVE POINT LODGE</h1>
                </div>
            </div>
            <div className="about-us">
                <div className="banner">
                    <img src="/img/home_bg2.png" />
                    <Button className="join-btn" variant='contained' href="https://discord.gg/kZZGSU3" color="primary">Join Now!</Button>
                </div>
                <div className="info">
                    <Container className="text" maxWidth="md">
                        <div className="flair">
                            <div className="top"></div>
                            <div className="bottom"></div>
                        </div>
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
                            to weary travelers and this space will be kept safe.</span>
                    </Container>
                    <Container className="invite" maxWidth="sm">
                        <h2>See below to join!</h2>
                        <div className="widget-container">
                            <div className="flair">
                                <div className="top"></div>
                                <div className="bottom"></div>
                            </div>
                            <iframe src="https://discord.com/widget?id=184535415363993600&theme=dark" width="350" height="500" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                        </div>
                        <p className="signin">Or&nbsp;<a href="/login">sign in</a>&nbsp;if you're already a member.</p>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Home;