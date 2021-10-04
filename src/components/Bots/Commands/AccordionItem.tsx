import React, { ChangeEvent } from 'react';

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography
} from '@material-ui/core';
import ListRoundedIcon from '@material-ui/icons/ListRounded';

import { Command } from '../../../types';

type AccordionItemProps = {
    open: boolean;
    select: (index: number, expanded: boolean) => void
    index: number;
    command: Command;
}

const AccordionItem: React.FC<AccordionItemProps> = (props: AccordionItemProps) => {

    const indexString = `panel-${props.index}`;

    const _onChange = (e: ChangeEvent<{}>, expanded: boolean) => {
        props.select(props.index, expanded);
    }

    return (
        <Accordion expanded={props.open} onChange={_onChange} className='command-item'>
            <AccordionSummary
                expandIcon={<ListRoundedIcon />}
                aria-controls={indexString}
                id={indexString}
            >
                <Typography style={{ width: '33%', flexShrink: 0 }}>
                    {props.command.name}
                </Typography>
                <Typography style={{ color: 'text.secondary' }}>{props.command.description}</Typography>
            </AccordionSummary>
            {props.open && <hr />}
            <AccordionDetails className='command-details'>
                <Typography style={{ width: '25%', flexShrink: 0 }}>Command Parameters:</Typography>
                <div className='parameters-border'></div>
                {props.command.options && <div className='params-list'>
                    {props.command.options.map((param: any, i: number) => {
                        return (
                            <div key={i} className='param'>
                                <span>Name: <strong>{param.name}</strong></span>
                                <span>Required: {param.required ? '✔️' : '❌'}</span>
                                <span>Description: <strong>{param.description}</strong></span>
                                {i !== props.command.options.length - 1 && <hr />}
                            </div>
                        );
                    })}
                </div>}
            </AccordionDetails>
        </Accordion>
    );
}

export default AccordionItem;