import React from "react";
import {
    Home,
    Contacts,
    Keyboard,
    Subscriptions,
    VolumeUp,
    MonitorHeart,
    Build
} from '@mui/icons-material';

import { Pages } from "../../../types";

export const AllPages: Pages = {
    // Logo: {
    //     to: "/",
    //     label: <img src='/img/logo.png' />
    // },
    Home: {
        to: "/",
        icon: <Home />
    },
    Joe_Bot: {
        to: "/our-bots",
        icon: <Contacts />
    },
    Commands: {
        to: "/commands",
        disabled: false,
        icon: <Keyboard />
    },
    Soundboard: {
        to: "/soundboard",
        requiresAuth: true,
        requiresSoundboarder: true,
        icon: <VolumeUp />
    },
    'ARC Workbench': {
        to: '/arc-workbench',
        icon: <Build />
    },
    Status: {
        to: "https://status.savepointlodge.com",
        externalSite: true,
        icon: <MonitorHeart />
    },
    Subscribe: {
        to: "https://ptb.discord.com/servers/save-point-lodge-184535415363993600",
        externalSite: true,
        icon: <Subscriptions />
    }
}

