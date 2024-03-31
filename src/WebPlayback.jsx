import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { addToQueue } from './auth.js'

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function WebPlayback(props) {
    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);

    useEffect(() => {
        if (!document || !document.body) {
            return;
        } 

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document && document.body && document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });
            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state => {
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true)
                });
            }));

            player.connect();
        };
    }, []);

    const handleAddToQueue = async () => {
        await addToQueue(props.token, "spotify:track:5xYR2G6YOEzX2X9asFUrOE");
        player.nextTrack();
    }

    return (
        <>
            <Grid className="container">
                <Grid 
                    className="main-wrapper"
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    {
                        current_track && 
                        <img 
                            src={current_track.album.images[0].url}
                            className="now-playing__cover" alt="" 
                            width="500px"
                            height="500px"
                        />
                    }

                    <Grid 
                        className="now-playing__side"
                        item
                        container
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                            margin: "14px 0",
                            fontSize: "20px",

                        }}
                    >
                        <Grid className="now-playing__name">{
                            current_track.name
                        }</Grid>
                        <Grid className="now-playing__artist">{
                            current_track.artists[0].name
                        }</Grid>
                    </Grid>
                    <Grid
                        item
                        container
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Button 
                            className="btn-spotify" 
                            onClick={() => { player.previousTrack() }} 
                            variant="outlined"
                        >
                            &lt;&lt;
                        </Button>

                        <Button 
                            className="btn-spotify" 
                            onClick={() => { player.togglePlay() }} 
                            variant="outlined"
                            style={{
                                margin: "0 10px",
                                height: "60px",
                                width: "150px"
                            }}
                        >
                            {is_paused ? "PLAY" : "PAUSE"}
                        </Button>

                        <Button 
                            className="btn-spotify" 
                            onClick={() => { player.nextTrack() }} 
                            variant="outlined"
                        >
                            &gt;&gt;
                        </Button>
                    </Grid>
                    <Button onClick={handleAddToQueue}>Add to queue</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default WebPlayback
