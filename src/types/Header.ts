import React from "react";

import { User } from './ReduxItems';

export interface PageLink {
    to: string,
    isLogo?: boolean,
    label?: React.ReactNode;
    requiresAuth?: boolean,
    requiresSoundboarder?: boolean,
    disabled?: boolean,
    externalSite?: boolean
}

export interface MobilePageLink extends PageLink {
    icon: React.ReactNode;
}

export interface Pages {
    [id: string]: PageLink | MobilePageLink;
}