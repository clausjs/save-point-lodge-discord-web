import React from "react";

export interface CenteredTabsProps {
    childrenList: {
        [id: string]: {
            component: React.ReactNode;
        }
    }
}