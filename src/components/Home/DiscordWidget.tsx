import React, { useState, useLayoutEffect } from 'react';
import fetch from 'node-fetch';
import { DiscordUser, DiscordUser as User } from '../../types';

import '../../sass/widget.scss';
import { RootState } from '../../reducers';
import { fetchDiscordWidget } from '../../actions';
import { connect } from 'react-redux';

type DiscordWidgetProps = {
    members?: DiscordUser[];
    getWidget?: () => void;
}

const DiscordWidget: React.FC<DiscordWidgetProps> = (props) => {
    // const [ userlist, setUserlist ] = useState<any[]>([]);
    const [ fetchedUserList, setFetchedUserList ] = useState<boolean>(false);

    const { members: userlist = [], getWidget = () => {} } = props;

    useLayoutEffect(() => {
        if (!fetchedUserList) {
            setFetchedUserList(true);
            getWidget();
        }
    }, [fetchedUserList]);

    console.log("MEMBERS: ", userlist);

    return (
        <div className='widget-content'>
            <div className='content-header'>
                <a className='widgetLogo' href='https://discord.com' target="_blank" />
                <span className='online-count'>
                    <strong>{userlist.length}</strong>
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
                        {userlist.map((user: User, i: number) => {
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

const mapStateToProps = (state: RootState): { members: DiscordUser[] } => {
    const { members } = state.discord;
    return { members };
}

const mapDispatchToProps = (dispatch: any) => ({
    getWidget: () => dispatch(fetchDiscordWidget())
})

export default connect(mapStateToProps, mapDispatchToProps)(DiscordWidget);