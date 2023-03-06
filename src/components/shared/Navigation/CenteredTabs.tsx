import React, { useState, useEffect } from 'react';

import { CenteredTabsProps } from '../../../types';

import {
    Paper,
    Tabs,
    Tab
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    root: {
        flexGrow: 1
    }
});

const CenteredTabs: React.FC<CenteredTabsProps> = (props) => {
    const classes = useStyles();
    const [value, setValue] = useState(0);

    const handleChange = (event: React.ChangeEvent, newValue: any) => {
        setValue(newValue);
    };

    return (
        <Paper className={classes.root}>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                {Object.keys(props.childrenList).map((childLabel, i) => {
                    return (
                        <Tab key={i} label={childLabel}>
                            {props.childrenList[childLabel]}
                        </Tab>
                    );
                })}
            </Tabs>
        </Paper>
    );
}

export default CenteredTabs;