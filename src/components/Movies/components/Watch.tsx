import React, { useEffect, useState } from 'react';

import {
    User
} from '../../../types';

import '../../../sass/movies.scss';

const Watch: React.FC<{ auth: User | null }> = (auth = null) => {
    const [ player, setPlayer ] = useState(null);

    useEffect(() => {
        if (auth !== null && !player) {
            //@ts-ignore
            const sldpPlayer = SLDP.init({
                container:           'player',
                stream_url:          "ws://planetexpressmovie.redirectme.net:8081/movie/obs",
                splash_screen:       `img/splash_screen.png`,
                buffering:           1000,
                sync_buffer:         4000,
                controls:            true,
                autoplay:            false,
                key_frame_alignment: true,
                reconnects:          100,
                width:   'parent',
                height:  'parent',
            });
            setPlayer(sldpPlayer);
        }
    }, [auth]);

    if (auth) {
        return (
            <div className="movie-container">
                <p>
                    Double Click To Enter Fullscreen!
                </p>
                <div id="player"></div>
            </div>
        );
    } else return null;
}

export default Watch;