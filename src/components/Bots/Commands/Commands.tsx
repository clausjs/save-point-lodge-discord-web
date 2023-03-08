import React, { ChangeEvent, useEffect, useState } from "react";
import { connect, useSelector } from 'react-redux';

import {
    Accordion,
    Container
} from '@material-ui/core';

import DisplayTable from '../../shared/DisplayTable/DisplayTable';
import AccordionItem from "./AccordionItem";
import { Command, TabledCommands, TableHeader, TableCell } from "../../../types";
import { fetchCommands } from "../../../actions/botsActions";

import '../../../sass/commands.scss';
import { CircleLoader, PacmanLoader } from "react-spinners";

const LOADING_SIZE: number = 150;

interface CommandsProps {
    commands: Command[];
    getCommands: Function;
    children: React.ReactNode;
}

const Commands: React.FC<CommandsProps> = (props) => {

    const [ fetchedCommands, setFetchedCommands ] = useState<boolean>(false);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ commands, setCommands ] = useState<TabledCommands | {}>({});
    const [ expanded, setExpanded ] = useState<number>(-1);

    const lightMode: boolean = useSelector((state: any) => state.theme.lightMode);

    useEffect(() => {
        if (!fetchedCommands) {
            setIsLoading(true);
            props.getCommands();
            setFetchedCommands(true);
        }
    });

    const generateTabledCommandsFromProps = () => {
        const newCommands = {};
        props.commands.map((commandFromDb: any) => {
            //@ts-ignore
            if (!newCommands[commandFromDb.name]) {
                //@ts-ignore
                newCommands[commandFromDb.name] = commandFromDb;
            }
        });
        return newCommands;
    }

    useEffect(() => {
        if (Object.keys(commands).length !== props.commands.length) {
            setCommands(generateTabledCommandsFromProps());
            setIsLoading(false);
        }
    }, [props.commands]);


    const onAccordionChange = (index: number, open: boolean) => {
        if (open) {
            setExpanded(index);
        } else {
            if (index === expanded) {
                setExpanded(-1);
            }
        }
    }

    return (
        <div className="commands-content">
            {isLoading && <div className='loading'>
                <h3>Finding the fruit...</h3>
                <div className='loader-container'>
                    <PacmanLoader loading={isLoading} size={75} color={lightMode ? 'black' : 'white'} margin={0} />
                </div>
            </div>}
            {!isLoading && <Container className='commands' maxWidth='xl'>
                {props.commands.map((command: Command, index: number) => {
                    return (
                        <AccordionItem
                            key={index} 
                            open={expanded === index} 
                            select={onAccordionChange} 
                            index={index} 
                            command={command}
                        />
                    )
                })}
            </Container>}
        </div>
    );
};

const mapStateToProps = (state: any) => {
    const { commands } = state.bots;
    return { commands }
};

const mapDispatchToProps = (dispatch: any) => ({
    getCommands: () => dispatch(fetchCommands())
});

export default connect(mapStateToProps, mapDispatchToProps)(Commands);