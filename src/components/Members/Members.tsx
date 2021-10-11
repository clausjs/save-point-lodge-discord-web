import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import {
    CssBaseline,
    Typography,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch
} from '@material-ui/core';

import { BounceLoader } from 'react-spinners';

import DisplayTable from "../shared/DisplayTable/DisplayTable"

import { RootState } from '../../reducers';

import { fetchUserOpts, setUserOption } from '../../actions';

import '../../sass/members.scss';
import { UserOption, UserOptions } from '../../types';

interface MemberOptionsProps {
    fetchOpts: Function;
    setOpt: Function;
    children: React.ReactNode;
}

interface TableOpt {
    value: boolean;
    description: any;
    isLoading?: boolean;
}

interface DisplayTableUserOpts {
    [id: string]: TableOpt;
}

const Members: React.FC<MemberOptionsProps> = (props) => {

    const [ fetchedUserOpts, setFetchedUserOpts ] = useState<boolean>(false);
    const user = useSelector((state: RootState) => state.user.user);
    const opts = useSelector((state: RootState) => state.user.opts);

    useEffect(() => {
        if (user !== null && !fetchedUserOpts) {
            props.fetchOpts();
            setFetchedUserOpts(true);
        }
    }, [user]);

    const toggleOption = (event: any) => {
        const { value: label } = event.target.attributes["aria-label"];
        //@ts-ignore
        const newOpt: UserOption = {};
        //@ts-ignore
        newOpt[label] = !opts[label];
        const fullOptions: DisplayTableUserOpts = opts;
        //@ts-ignore
        if (fullOptions.hasOwnProperty(label)) fullOptions[label].isLoading = true;
        props.setOpt(newOpt);
    }

    const getContainerContent = () => {
        if (user === null) {
            return (<h3>You must login with discord to continue. <a href="/login">Click here</a></h3>);
        }

        return (
            <>
                <h2>{`${user.username}'s user options on Save Point Lodge`}</h2>
                <DisplayTable
                    rowData={opts}
                    tableHeaders={[
                        {
                            label: 'Option',
                            align: 'left'
                        },
                        {
                            label: 'Description',
                            align: 'center'
                        },
                        {
                            label: 'Toggle',
                            align: 'right'
                        }
                    ]}
                    tableCells={[
                        {
                            component: 'th',
                            scope: 'row',
                            valueGetter: (item: any) => {
                                const index = Object.values(opts).findIndex(opt => opt.description.text === item.description.text);
                                if (index !== -1) {
                                    return <span>{Object.keys(opts)[index]}</span>
                                }
                            }
                        },
                        {
                            cellRenderer: (item: any) => {
                                const description = item.description;
                                const altText = ` :${description.alt}: emoji `;
                                return (
                                    <span className='description-cell'>
                                        {description.text}
                                        <img src={description.url} alt={altText} title={altText} />    
                                    </span>
                                );
                            }
                        },
                        {
                            align: 'center',
                            valueGetter: (item: any) => {
                                const index: number = Object.values(opts).findIndex(opt => opt.description.text === item.description.text);

                                let key: string;
                                if (index !== -1) {
                                    key = Object.keys(opts)[index];
                                }

                                //@ts-ignore
                                return <Switch inputProps={{ 'aria-label': key }} checked={opts[key].value} onChange={toggleOption} />
                            }
                        }
                    ]}
                    searchLabel={false}
                    itemName="user option"
                    tableId='member options table'
                    isLoadingData={!fetchUserOpts}
                />
            </>
        );
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth='lg'>
                <Typography component="div" style={{ backgroundColor: '#ffffff' }} />
                <div className='member-main'>
                    {getContainerContent()}
                </div>
            </Container>
        </React.Fragment>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    fetchOpts: () =>  dispatch(fetchUserOpts()),
    setOpt: (option: any) => dispatch(setUserOption(option))
});

export default connect(null, mapDispatchToProps)(Members);