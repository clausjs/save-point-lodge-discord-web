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
            // const sldpPlayer = SLDP.init({
            //     container:           'player',
            //     stream_url:          "wss://planetexpressmovie.ddns.net:8081/live/spl-movies",
            //     splash_screen:       `img/splash_screen.png`,
            //     buffering:           1000,
            //     sync_buffer:         4000,
            //     controls:            true,
            //     autoplay:            false,
            //     key_frame_alignment: true,
            //     reconnects:          100,
            //     width:   'parent',
            //     height:  'parent',
            // });
            // setPlayer(sldpPlayer);
            const video = document.getElementById('hsljs-video-tag');
            //@ts-ignore
            const hls = new Hls();
            hls.loadSource("https://planetexpressmovie.ddns.net/live/spl-movies/playlist.m3u8");
            hls.attachMedia(video);
            //@ts-ignore
            hls.on(Hls.Events.MANIFEST_PARSED,function() {
                //@ts-ignore
                video.play();
            });
        }
    }, [auth]);

    if (auth) {
        return (
            <div className="movie-container">
                <p>
                    Double Click To Enter Fullscreen!
                </p>
                <video id='hsljs-video-tag'></video>
            </div>
        );
    } else return null;
}

export default Watch;