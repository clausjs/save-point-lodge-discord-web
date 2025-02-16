import React, { useEffect, useState } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';

import {
    Container,
    Switch
} from '@mui/material';

import DisplayTable from "../shared/DisplayTable/DisplayTable"

// import { RootState } from '../../store/configureStore';
import { AppDispatch, RootState } from '../../state/store';

// import { fetchUserOpts, setUserOption } from '../../actions';

import './Members.scss';
import { User, UserOption, UserOptions } from '../../types';
import { fetchUser, setOption } from '../../state/reducers/user';

const Members: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user: User = useSelector((state: RootState) => state.user.user);
    const isLodgeGuest: boolean = useSelector((state: RootState) => state.user.user?.isPlanetExpressMember) || false;
    const opts: UserOptions = useSelector((state: RootState) => state.user.opts);
    const [ fetchedUserOpts, setFetchedUserOpts ] = useState<boolean>(false);

    useEffect(() => {
        if (user !== null && !fetchedUserOpts) {
            dispatch(fetchUser());
            setFetchedUserOpts(true);
        }
    }, [user]);

    const toggleOption = (event: any) => {
        const { name: label } = event.target;
        if (opts.hasOwnProperty(label)) {
            const newOpt: UserOption = {
                value: !opts[label].value,
                description: opts[label].description
            };
            dispatch(setOption({ ...opts, [label]: newOpt } as UserOptions));
        }
        // const newOpt: UserOption | {} = {};
        // newOpt[label] = !opts[label].value;

        // props.setOpt(newOpt);
        // dispatch(setOption({ ...opts, newOpt } as UserOptions));
    }

    const getContainerContent = () => {
        let errorMessage: string | false = false;
        if (user === null) errorMessage = "You must login with Discord to continue.";
        else if (!isLodgeGuest) errorMessage = "To access these options, come join us on Discord!";

        if (errorMessage) {
            return (<h3>{errorMessage} <a href={`${isLodgeGuest ? "/login" : "https://discord.gg/spl"}`}>Click here</a></h3>)
        }

        return (
            <React.Fragment>
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
                                return <Switch inputProps={{ 'aria-label': key }} name={key} checked={opts[key].value} onChange={toggleOption} />
                            }
                        }
                    ]}
                    searchLabel={false}
                    itemName="user option"
                    tableId='member options table'
                    isLoadingData={!fetchedUserOpts}
                />
            </React.Fragment>
        );
    }

    return (
        <Container className='member-main' maxWidth='xl'>
            {getContainerContent()}
        </Container>
    );
}

export default Members;