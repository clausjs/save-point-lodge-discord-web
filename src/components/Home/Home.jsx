import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import '../../sass/home.scss';

const Home = (props) => {
    return (
        <React.Fragment>
            <CssBaseline />
            <img className="banner-image" src={"img/banner.png"}></img>
            <Container maxWidth="md">
                <Typography component="div" style={{ backgroundColor: '#ffffff' }} />
                <div className="main">
                    <p>Welcome to the Planet Express Discord! We started in 2016 as a communal space on the internet to share a 
                        love of gaming and built around the ideals of inclusivity, respect, and accessibility. Though we started 
                        as Lord of the Rings themed server with a heavy leaning toward Overwatch content, we now have an active 
                        player base in many games, including Apex Legends, Diablo 3, and Sid Meier’s Civilization, as well as 
                        plenty of channels for discussion of non-gaming subjects, like movies, music, and DIY projects.</p>

                    <p>Throughout our existence, we’ve made changes based on member feedback and testing and we intend to continue 
                        using that as a tool to make the discord as user-friendly as possible, having a public channel dedicated 
                        solely to allowing members to make suggestions regarding the layout, rules, and overall experience.</p>

                    <p>Our channels are patrolled by the abrasive but very helpful Joe_Bot, a creation of the server owner, 
                        ice2morrow. It is programmed to streamline your experience, allowing you to choose which channel groups 
                        to display, toggle auto-reactions, or even create new channels for the game you are playing!</p>

                    <p className='links'><a href="https://discord.gg/kZZGSU3">Join us on Discord!</a></p>

                    <p className="links">If you're already a member,&nbsp;<a href="/login">sign in</a>&nbsp;above to configure server specific items!</p>
                </div>
            </Container>
        </React.Fragment>
    );
};

export default Home;