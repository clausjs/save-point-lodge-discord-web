import React from "react";
import {
    Home,
    Contacts,
    Keyboard,
    Movie,
    Subscriptions
} from '@material-ui/icons';

import { Pages } from "../../../types";

export const AllPages: Pages = {
    Logo: {
        to: "/",
        label: <img src='/img/logo.png' />
    },
    Home: {
        to: "/",
        icon: <Home />
    },
    "Bots on SPL": {
        to: "/our-bots",
        icon: <Contacts />
    },
    Commands: {
        to: "/commands",
        disabled: false,
        icon: <Keyboard />
    },
    Movies: {
        to: "/movies",
        requiresAuth: true,
        requiresMoviegoer: true,
        icon: <Movie />
    },
    Subscribe: {
        to: "https://ptb.discord.com/servers/save-point-lodge-184535415363993600",
        externalSite: true,
        icon: <Subscriptions />
    }
}

