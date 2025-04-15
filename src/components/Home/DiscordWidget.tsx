import React, { useState, useLayoutEffect } from 'react';
import { DiscordUser, DiscordUser as User } from '../../types';

import './Widget.scss';
import { fetchDiscordMembers } from '../../state/reducers/discord';
import { connect, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { useSelector } from 'react-redux';

const DiscordWidget: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [ fetchedUserList, setFetchedUserList ] = useState<boolean>(false);

    const members: DiscordUser[] = useSelector((state: RootState) => state.discord.members);

    useLayoutEffect(() => {
        if (!fetchedUserList) {
            setFetchedUserList(true);
            dispatch(fetchDiscordMembers());
        }
    }, [fetchedUserList]);

    return (
        <div className='widget-content'>
            <div className='content-header'>
                <a className='widgetLogo' href='https://discord.com' target="_blank" />
                <span className='online-count'>
                    <strong>{members.length}</strong>
                    <> </>
                    <> Members</>
                    <> Online</>
                </span>
            </div>
            <div className='content-body'>
                <div></div>
                <div className='user-list'>
                    <div className='membersOnline'>Members Online</div>
                    <div>
                        {members.map((user: User, i: number) => {
                            return (
                                <div className='widget-member' key={i}>
                                    <div className='widget-avatar'>
                                        <img src={user.avatar_url} />
                                        <span className={`status ${user.status}`}></span>
                                    </div>
                                    <span className='member-name'>{user.username}</span>
                                    {user.game && <span className='member-game'>{user.game.name}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className='content-footer'>
                <span className='footer-info'>Free voice chat from Discord</span>
                <a className='widget-button' href="https://discord.gg/spl" target="_blank">Connect</a>
            </div>
        </div>
    );
}

export default DiscordWidget;