import React from 'react';

const WS_VIDEO_URL_BASE = "ws://IP:8081/movie/obs"

export default class Watch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: "ws://planetexpressmovie.redirectme.net:8081/movie/obs",
            player: null
        };
        this.bindCorrectContext();
    }
    bindCorrectContext() {
        this.initPlayer = this.initPlayer.bind(this);
    }
    componentDidMount() {
        this.initPlayer();
    }
    componentWillUnmount() {
        const { player } = this.state;

        if (player) player.destroy();
    }
    initPlayer() {
        console.log("Entered initPlayer: ", SLDP);
        const sldpPlayer = SLDP.init({
            container:           'player',
            stream_url:          this.state.url,
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

        this.setState({
            player: sldpPlayer
        });
    }
    render() {
        return (
            <div className="movie-container">
                <center>
                    <p>
                        Double Click To Enter Fullscreen!
                    </p>
                </center>
                <div id="player"></div>
            </div>
        );
    }
}