import React, { useEffect } from 'react';

import './PostAuth.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { useNavigate } from 'react-router';

const ORIGIN_PROTOCOL = window.location.protocol;
const ORIGIN_HOST = window.location.host;
const ORIGIN = `${ORIGIN_PROTOCOL}//${process.env.NODE_ENV === 'development' ? 'localhost:3000' : ORIGIN_HOST}`;

const PostAuth: React.FC = () => {
    const history = useNavigate();
    const userFetchState = useSelector((state: RootState) => state.user.userFetchState);

    useEffect(() => {
        if (userFetchState !== 'pending') history('/');

        window.addEventListener('message', (event) => {
            if (event.origin !== ORIGIN) return;
            const data = JSON.parse(event.data);
            if (data.type === 'discord-auth-heartbeat') {
                event.source.postMessage(JSON.stringify({ type: 'loginResponse' }), { targetOrigin: event.origin });
            }
        });
    }, []);

    return (
        <div className='post-auth'>
            <div className='heading'>
                <img src='/img/logo.png' alt="SPL logo" />
                <h3>Login Success!</h3>
                <span></span>
            </div>
            <h6>This window will close automatically.</h6>
        </div>
    );
};

export default PostAuth;