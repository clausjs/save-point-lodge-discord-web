import React from "react";

import { User } from './ReduxItems';

export interface View {
    to: string,
    requiresAuth?: boolean,
    requiresMoviegoer?: boolean,
    disabled?: boolean,
    class?: string,
    ancillary?: {
        content: string | React.ReactNode;
        class?: string;
    }
}

export interface PageViews {
    [id: string]: View
}

export interface HeaderProps {
    user?: User | null;
    views?: {
        [id: string]: {
            to: string;
        }
    };
    getAuth?: Function;
    children?: React.ReactNode;
}