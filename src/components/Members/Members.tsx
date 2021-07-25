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

interface MemberOptionsProps {
    fetchOpts: Function;
    setOpt: Function;
    children: React.ReactNode;
}

interface TableOpt {
    value: boolean;
    description: any;
    isLoading: boolean;
}

interface DisplayTableUserOpts {
    [id: string]: TableOpt;
}

const Members: React.FC<MemberOptionsProps> = (props) => {

    const [ userOpts, setUserOpts ] = useState<DisplayTableUserOpts | {}>({});
    const [ fetchUserOpts, setFetchedUserOpts ] = useState<boolean>(false);
    const user = useSelector((state: RootState) => state.user.user);
    const opts = useSelector((state: RootState) => state.user.opts);
    const descriptions = useSelector((state: RootState) => state.user.descriptions);

    useEffect(() => {
        if (user !== null && !fetchUserOpts) {
            props.fetchOpts();
            setFetchedUserOpts(true);
        }
    }, [user]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') console.info("Opts/Descriptions have changed");
        const userOptions: DisplayTableUserOpts | {} = {};
        if (Object.keys(opts).length > 0 === Object.keys(descriptions).length > 0) {
            for (const optKey of Object.keys(opts)) {
                if (!userOptions.hasOwnProperty(optKey) && descriptions.hasOwnProperty(optKey)) {
                    //@ts-ignore
                    const description = descriptions[optKey];
    
                    const newKey: TableOpt = {
                        //@ts-ignore        
                        value: opts[optKey],
                        description,
                        isLoading: false
                    };
    
                    //@ts-ignore
                    userOptions[optKey] = newKey;
                }
            }
        }

        setUserOpts(userOptions);
    }, [opts, descriptions]);

    const toggleOption = (event: any) => {
        const { value: label } = event.target.attributes["aria-label"];
        const newOpt = {};
        //@ts-ignore
        newOpt[label] = !opts[label];
        const fullOptions = userOpts;
        //@ts-ignore
        if (fullOptions.hasOwnProperty(label)) fullOptions[label].isLoading = true;
        props.setOpt(newOpt);
        setUserOption(fullOptions);
    }

    const getContainerContent = () => {
        if (user === null) {
            return (<h3>You must login with discord to continue. <a href="/login">Click here</a></h3>);
        }

        return (
            <>
                <h2>{`${user.username}'s user options on Save Point Lodge`}</h2>
                <DisplayTable
                    rowData={userOpts}
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
                                const index = Object.values(userOpts).findIndex(opt => opt.description.text === item.description.text);
                                if (index !== -1) {
                                    return <span>{Object.keys(userOpts)[index]}</span>
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
                                const index: number = Object.values(userOpts).findIndex(opt => opt.description.text === item.description.text);

                                let key: string;
                                if (index !== -1) {
                                    key = Object.keys(userOpts)[index];
                                }

                                //@ts-ignore
                                if (userOpts[key].isLoading) {
                                    return <BounceLoader size={12} />;
                                }

                                //@ts-ignore
                                return <Switch inputProps={{ 'aria-label': key }} checked={userOpts[key].value} onChange={toggleOption} />
                            }
                        }
                    ]}
                    searchLabel={false}
                    itemName="user option"
                    tableId='member options table'
                    isLoadingData={Object.keys(userOpts).length === 0}
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