import React, { useEffect } from 'react';

import './PostAuth.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { useNavigate } from 'react-router';
import { apiState, User } from '../../types';
import { CircleLoader } from 'react-spinners';


const PostAuth: React.FC = () => {
    const history = useNavigate();
    const user: User | null = useSelector((state: RootState) => state.user.user);
    const userFetchState: apiState = useSelector((state: RootState) => state.user.userFetchState);

    useEffect(() => {
        if (user && ['fulfilled'].includes(userFetchState)) {
            history('/');
        }
    }, [user]);

    const success: boolean = userFetchState === 'fulfilled' && user !== null;
    const error: boolean = userFetchState === 'rejected';

    return (
        <div className='post-auth'>
            <div className='heading'>
                <img src='/img/logo.png' alt="SPL logo" />
                {!user || userFetchState !== 'fulfilled' && <CircleLoader />}
                {success && <h3>Login Success!</h3>}
                {error && <h3>Login Failed</h3>}
            </div>
            {success && <h6>This window will close automatically.</h6>}
            {error && <h6>There was an error logging in. Please close this window and try again.</h6>}
        </div>
    );
};

export default PostAuth;