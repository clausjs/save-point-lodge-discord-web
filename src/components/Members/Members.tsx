import React, { useEffect, useState } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';

import {
    Box,
    Container,
    Grid2 as Grid,
    Switch,
    Typography
} from '@mui/material';

import DisplayTable from "../shared/DisplayTable/DisplayTable"

// import { RootState } from '../../store/configureStore';
import { AppDispatch, RootState } from '../../state/store';

// import { fetchUserOpts, setUserOption } from '../../actions';

import './Members.scss';
import { SoundboardOpt, SoundboardOptions, User, UserOption, UserOptions } from '../../types';
import { fetchSoundboardOpts, fetchUser, fetchUserOpts, setOption, setSoundboardOption } from '../../state/reducers/user';

const Members: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user: User = useSelector((state: RootState) => state.user.user);
    const isLodgeGuest: boolean = useSelector((state: RootState) => state.user.user?.isPlanetExpressMember) || false;
    const opts: UserOptions = useSelector((state: RootState) => state.user.opts);
    const soundboardOpts: SoundboardOptions = useSelector((state: RootState) => state.user.soundboardOpts);
    const [ fetchedUserOpts, setFetchedUserOpts ] = useState<boolean>(false);

    useEffect(() => {
        if (user === null) {
            dispatch(fetchUser());
        }

        if (user !== null && !fetchedUserOpts) {
            dispatch(fetchUserOpts());
            dispatch(fetchSoundboardOpts());
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
    }

    const toggleSoundboardOption = (event: React.ChangeEvent<any>) => {
        const { name: label } = event.target;
        if (soundboardOpts.hasOwnProperty(label)) {
            const newOpt: SoundboardOpt = {
                description: soundboardOpts[label].description,
                enabled: !soundboardOpts[label].enabled
            };
            dispatch(setSoundboardOption({ ...soundboardOpts, [label]: newOpt } as SoundboardOptions));
        }
    }

    return (
        <Container className='account-settings' maxWidth='xl'>
            <Typography variant='h4'>Account Settings</Typography>
            <Typography variant='h6' gutterBottom>{`${user.username}'s Joe_Bot settings`}</Typography>
            <Grid className='member-main' container spacing={2} columns={{ xs: 1, md: 2 }}>
            {user && user.isSoundboardUser && Object.keys(soundboardOpts).length > 0 && <Grid className='soundboard-opts' size={1}>
                    <Typography variant='body1'>Joe_Bot Soundboard Options</Typography>
                    <DisplayTable
                        rowData={soundboardOpts}
                        tableHeaders={[
                            {
                                label: 'Toggle',
                                align: 'center'
                            },
                            {
                                label: 'Description',
                                align: 'center'
                            }
                        ]}
                        tableCells={[
                            {
                                component: 'th',
                                scope: 'row',
                                cellRenderer: (item: any) => {
                                    const index: number = Object.values(soundboardOpts).findIndex(opt => opt.description === item.description);

                                    let key: string;
                                    if (index !== -1) {
                                        key = Object.keys(soundboardOpts)[index];
                                    }

                                    return <Switch inputProps={{ 'aria-label': key }} name={key} checked={item.enabled} onChange={toggleSoundboardOption} />
                                }
                            },
                            {
                                valueGetter: (item: any) => {
                                    return item.description;
                                }
                            }
                        ]}
                        searchLabel={false}
                        itemName="soundboard option"
                        tableId='soundboard options table'
                        isLoadingData={!fetchedUserOpts}
                    />
                </Grid>}
                <Grid className='member-opts' size={1}>
                    <Typography variant='body1'>Discord Messaging Settings</Typography>
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
                </Grid>
            </Grid>
        </Container>
    );
}

export default Members;