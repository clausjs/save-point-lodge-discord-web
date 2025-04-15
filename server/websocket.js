const WebsocketClient = require('websocket').client;

class WSClient {
    client;
    connection;

    constructor(url, port) {
        this.client = new WebsocketClient();
        this.init(url, port);
    }
    init = (url, port) => {
        this.client.on('connect', (connection) => {
            this.connection = connection;

            connection.on('error', (error) => {
                console.error("play-sound connection error: ", error);
            });

            connection.on('close', () => {
                console.log("play-sound connection closed");
            });

            connection.on('message', (message) => {
                console.log("play-sound message: ", message);
            });
        });

        this.client.connect(`ws://${url}:${port}/soundboard?apiKey=${process.env.AUTHORIZED_API_KEY}`);
    }
    playSound = async (clip) => {
        this.connection.send(JSON.stringify({
            type: 'play_sound',
            sound: clip
        }), (err, res) => {
            if (err) {
                console.error("play-sound error: ", err);
            }
            console.log("play-sound response: ", res);
        });
    }
}

let client;
module.exports = {
    getWSClient: (url, port) => {
        if (!client) {
            client = new WSClient(url, port);
        }
        return client;
    }
}