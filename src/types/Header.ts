import React from "react";

import { User } from './ReduxItems';

export interface PageLink {
    to: string,
    label?: React.ReactNode;
    requiresAuth?: boolean,
    requiresMoviegoer?: boolean,
    disabled?: boolean,
    externalSite?: boolean
}

export interface MobilePageLink extends PageLink {
    icon: React.ReactNode;
}

export interface Pages {
    [id: string]: PageLink | MobilePageLink;
}

export interface HeaderProps {
    user?: User | null;
    views?: {
        [id: string]: {
            to: string;
        }
    };
    getAuth?: Function;
    getMoviegoerStatus?: Function;
    getGuestStatus?: Function;
    children?: React.ReactNode;
}