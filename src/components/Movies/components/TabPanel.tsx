import React from 'react';
import Box from '@material-ui/core/Box';

export type TabPanelProps = {
    value: number;
    index: number;
    className?: string;
    other?: any;
    children?: React.ReactNode;
} 

const TabPanel: React.FC<TabPanelProps> = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
};

export default TabPanel;