import React from 'react';

import {
    Container,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    useMediaQuery
} from '@mui/material';

import DiscordWidget from './DiscordWidget';
const showcases = [
    {
        "title": "Community Driven",
        "description": "The server is driven by the community. We want to make sure that the server is always evolving and improving to meet the needs of the community."
    },
    {
        "title": "Always up to date",
        "description": "Since Joe_Bot allows for trending game voice/text channel creation, the server is always up-to-date with the latest trends in gaming and what the community is playing."
    },
    {
        "title": "A place for everyone",
        "description": "Inclusion is a core value of Save Point Lodge. We want to make sure that everyone feels welcome and has a place to call home."
    },
    {
        "title": "SPL Dedicated Servers",
        "description": "With dedicated servers for Terraria and Minecraft, for a small fee anyone on the server can join in on the fun in dedicated servers that anyone can join at anytime."
    },
    {
        "title": "Community Events",
        "description": "Save Point Lodge  occassionally runs community events. These events are a great way to gather with server users and get to know new friends."
    }
];

import './Home.scss';

const Home: React.FC = () => {
    const isUnderSevenHundredPixels = useMediaQuery('(max-width:700px)');

    return (
        <Container className="home-content" maxWidth={false} disableGutters>
            <div className="main-header">
                <div className="logo">
                    <img src="/img/logo.png" />
                </div>
                <div className="heading">
                    <h1>SAVE POINT LODGE</h1>
                </div>
            </div>
            <Container className='about banner' maxWidth={false} disableGutters>
                <div className='banner-items'>
                    <div className='logo-join'>
                        <img src='/img/logo.gif'></img>
                        <div className='btn join' onClick={() => window.location.href = "https://discord.gg/kZZGSU3"}>
                            <div className='btn-content'>
                                <span className='action'>Join Our Discord!</span>
                                <span>discord.gg/spl</span>
                            </div>
                        </div>
                    </div>
                    <div className='invite'>
                        <div className="widget-container">
                            <div className='widget'>
                                <DiscordWidget />
                            </div>
                            <div className="flair">
                                <div className="top"></div>
                                <div className="bottom"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
            <Container className='info' maxWidth={false} disableGutters>
                <Container className="info-content">
                    <div className="about-us">
                        <h3>About Us...</h3>
                        <div className="top"></div>
                        <div className="bottom"></div>
                    </div>
                    <div className='text'>
                        <p>
                            Welcome to Save Point Lodge (SPL), a community founded in 2016 with the goal of bringing gamers together, 
                            fostering thoughtful discussions on the state of the world, and building meaningful friendships in a fun and welcoming environment.
                        </p>

                        <p>
                            Whether you're a hardcore gamer or a casual player, we have channels dedicated to a variety of games and platforms where you can connect 
                            with other like-minded individuals, share tips and tricks, and even organize multiplayer sessions. But gaming is just one aspect of our community.
                        </p>

                        <p>
                            We also have channels dedicated to discussing current events, social issues, and other thought-provoking topics. We believe that it's important to 
                            engage in meaningful conversations and learn from each other's perspectives, so we encourage our members to share their thoughts and engage in respectful debate.
                        </p>

                        <p>
                            Of course, we also know that sometimes you just want to relax and hang out with friends. That's why we have channels for sharing memes, posting pictures of pets, 
                            and just chatting about whatever's on your mind. Our community is a place where you can be yourself, make new friends, and have fun.
                        </p>

                        <p>
                            We take user feedback seriously and are always looking for ways to improve our server. Whether it's adding new channels, hosting events, or implementing new 
                            features, we want to hear from you. Our community is shaped by its members, and we're proud of the diverse and welcoming environment we've created together.
                        </p>

                        <p>So come join us and see what our community is all about. We can't wait to meet you!</p>

                        <h3>Our Promise</h3>
                        <span className='promise'>This is a 'Save Point'; as such no goblins, Lich Kings, or Walls of Death can harm you here. Our doors are open
                            to weary travelers and this space will be kept safe.</span>
                    </div>
                </Container>
            </Container>
            <Container className='showcase' maxWidth='lg' disableGutters={isUnderSevenHundredPixels}>
                <div className='showcase-header'>
                    <h3>What Save Point Lodge has to offer</h3>
                    <sub>We're proud of the community we've built. See below for some of our most notable features</sub>
                </div>
                <div className='cards'>
                    {showcases.map((showcase: any, index: number) => {
                        return (
                            <Card key={index} className='showcase-card' style={{ maxWidth: 250 }}>
                                <CardActionArea>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            {showcase.title}
                                        </Typography>
                                        <Typography className='card-subtext' variant='body2'>
                                            {showcase.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </div>
            </Container>
            <div className='footer-spacing'></div>
        </Container>
    );
};

export default Home;