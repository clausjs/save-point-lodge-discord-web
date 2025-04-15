import React from "react";

export interface PageLink {
    to: string,
    isLogo?: boolean,
    label?: React.ReactNode;
    requiresAuth?: boolean,
    requiresSoundboarder?: boolean,
    disabled?: boolean,
    externalSite?: boolean,
    icon?: React.ReactNode;
}

export interface Pages {
    [id: string]: PageLink;
}