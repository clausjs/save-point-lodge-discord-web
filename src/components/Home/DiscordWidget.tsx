import React, { useState, useLayoutEffect } from 'react';
import fetch from 'node-fetch';

type User = {
    id: string;
    username: string;
    discriminator: number;
    avatar: string;
    status: string;
    game?: any
    avatar_url: string;
}

import '../../sass/widget.scss';

const DiscordWidget: React.FC = () => {
    const [ userlist, setUserlist ] = useState<any[]>([]);
    const [ fetchedUserList, setFetchedUserList ] = useState<boolean>(false);

    useLayoutEffect(() => {
        if (!fetchedUserList) {
            console.log("fetching userlist");
            setFetchedUserList(true);
            fetch(process.env.DISCORD_API).then(res => res.json()).then(data => {
                const list = data.members.filter((user: User) => user.username !== 'BoobBot™');
                setUserlist(list);
            }).catch(err => {
                console.error("Error fetching widget info", err);
            })
        }
    }, [fetchedUserList]);

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

export default DiscordWidget;