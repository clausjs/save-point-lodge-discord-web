import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';

import {
    Container
} from '@material-ui/core';

import DisplayTable from '../shared/DisplayTable/DisplayTable';
import { Command, TabledCommands, TableHeader, TableCell } from "../../../types";
import { fetchCommands } from "../../actions/botsActions";

import '../../sass/commands.scss';

interface CommandsProps {
    commands: Command[];
    getCommands: Function;
    children: React.ReactNode;
}

const Commands: React.FC<CommandsProps> = (props) => {

    const [ fetchedCommands, setFetchedCommands ] = useState<boolean>(false);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ commands, setCommands ] = useState<TabledCommands | {}>({});

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

    let tableHeaders: TableHeader[], tableCells: TableCell[];
    if (props.commands.length > 0) {
        tableHeaders = [
            {
                label: 'Command Name'
            },
            {
                label: 'Description'
            },
            {
                label: 'Options'
            }
        ];

        tableCells = [
            {
                field: 'name'
            },
            {
                field: 'description'
            },
            {
                valueGetter: (item: any) => {
                    return (
                        <div className='command-option'>
                            {item.options !== undefined && item.options.length > 0 ? 
                                item.options.map((option: any, i: number) => {
                                    return (
                                        <div key={i} className="option-details">
                                            <span><b>Name: </b> {option.name}</span>
                                            <span><b>Is Required?:</b> {option.required ? '✔️' : '❌'}</span>
                                            <span><b>Description:</b> {option.description}</span>
                                        </div>
                                    )
                                })
                            :
                                <span className='na'>N/A</span>
                            }
                        </div>
                    )
                }
            }
        ];
    }

    const filterResults = (searchText: string) => {
        const newCommands = {};
        Object.keys(commands).map((commandName: string) => {
            //@ts-ignore
            const command: Command = commands[commandName];

            if (commandName.toLowerCase().includes(searchText.toLowerCase())) {
                //@ts-ignore
                if (!newCommands[commandName]) {
                    //@ts-ignore
                    newCommands[commandName] = command;
                }
            }

            if (command.options && command.options.length > 0) {
                for (let i = 0; i < command.options.length; i++) {
                    const option = command.options[i];
                    if (option.name.toLowerCase().includes(searchText.toLowerCase())) {
                        //@ts-ignore
                        if (!newCommands[commandName]) {
                            //@ts-ignore
                            newCommands[commandName] = command;
                        }
                    }
                }
            } 
        });
        return newCommands;
    }

    return (
        <div className="commands-content">
            <Container className='commands'>
                <DisplayTable
                    rowData={commands}
                    tableHeaders={tableHeaders}
                    tableCells={tableCells}
                    itemName='commands'
                    tableId='commands-table'
                    searchLabel='Search for a command'
                    filterResults={filterResults}
                    isLoadingData={isLoading}
                    paginationProps={{
                        count: Object.keys(commands).length,
                        initialPerPage: 10
                    }}
                />
            </Container>
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