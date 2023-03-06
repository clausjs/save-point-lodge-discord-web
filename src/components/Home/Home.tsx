import React, { useState, useLayoutEffect } from 'react';

import {
    Container,
} from '@material-ui/core';

import DiscordWidget from './DiscordWidget';

import '../../sass/home.scss';

const Home: React.FC = () => {
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
            <div className="about">
                <div className="banner">
                    {/* <img src={"/img/home_bg2.png"} /> */}
                    <div className='banner-items'>
                        <div className='btn commands' onClick={() => window.location.href = "/our-bots"}>
                            <div className='btn-content'>
                                <span className='action'>Get To Know Our Bots</span>
                                <span>With our very own bot created in-house!</span>
                            </div>
                        </div>
                        <img src='/img/logo.gif'></img>
                        <div className='btn join' onClick={() => window.location.href = "https://discord.gg/kZZGSU3"}>
                            <div className='btn-content'>
                                <span className='action'>Join Our Discord!</span>
                                <span>discord.gg/spl</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <h3>About us...</h3> */}
                <div className="info">
                    <Container className="text" maxWidth="md">
                        <div className="about-us">
                            <h3>About Us...</h3>
                            <div className="top"></div>
                            <div className="bottom"></div>
                        </div>
                        <p>
                            Welcome to Save Point Lodge (SPL) Discord server! We're a community of gamers and thinkers who love 
                            to come together and discuss the state of the world, as well as just hangout and have fun. Whether you're into 
                            first-person shooters, strategy games, or anything in between, you'll find like-minded individuals here who share 
                            your passion for gaming.
                        </p>

                        <p>
                            Our server was founded in 2016 with the goal of bringing together like-minded individuals who share a passion for 
                            gaming and intellectual curiosity. We believe that by fostering a welcoming and respectful community, 
                            we can create a space where people feel comfortable sharing their ideas and opinions. Our server is more than just a 
                            place to play games, though. We believe in having thoughtful discussions about the world around us, from politics and social issues 
                            to science and technology. We encourage everyone to share their opinions and ideas in a respectful and 
                            open-minded manner, and to listen and learn from one another.
                        </p>

                        <p>
                            But it's not all serious talk here. We also know how to let loose and have fun. 
                            We also have plenty of opportunities for gaming, whether it's joining in on group play 
                            sessions or sharing your favorite game recommendations. We believe that gaming can be a 
                            great way to connect with others and build relationships.
                        </p>

                        <p>
                            The lodge operates on behalf of, and with contribution from, its own members and staff. 
                            We take user feedback seriously and strive to shape our server based on the needs and 
                            preferences of our members. We are always open to new ideas and suggestions, 
                            and we encourage our members to be active participants in the community.
                        </p>

                        <h3>Our Promise</h3>
                        <span className='promise'>This is a 'Save Point'; as such no goblins, Lich Kings, or Walls of Death can harm you here. Our doors are open
                            to weary travelers and this space will be kept safe.</span>
                    </Container>
                    <Container className="invite" maxWidth="sm">
                        <h2>See below to join!</h2>
                        <div className="widget-container">
                            <div className='widget'>
                                <DiscordWidget />
                            </div>
                            <div className="flair">
                                <div className="top"></div>
                                <div className="bottom"></div>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Home;