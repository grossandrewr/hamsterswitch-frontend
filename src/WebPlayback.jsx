import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { getAlbumInfo, playAlbum, searchForAlbum } from './auth.js'

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
    const [albumResults, setAlbumResults] = useState([]);

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
    
    const handleAddAlbumToQueue = async (albumId) => {
        await playAlbum(props.token, `spotify:album:${albumId}`)
    }

    const handleSearchAlbums = async (albumsToFind) => {
        const constantAlbumsToFind = [
            ["Rubber Soul", "The Beatles"],
            ["In Rainbows", "Radiohead"],
            ["Cowboy Carter", "Beyonce"],
            ["Dark Side of the Moon", "Pink Floyd"]
        ]
        const results = []
        for (let i = 0; i < constantAlbumsToFind.length; i++) {
            const albumName = constantAlbumsToFind[i][0];
            const artistName = constantAlbumsToFind[i][1];
            const albumResult = await searchForAlbum(props.token, albumName, artistName);
            results.push(albumResult)
        }
        setAlbumResults(results)
    }

    const getAlbumGrid = () => {
        if (!albumResults.length) return null
        return albumResults.map(album => 
            <Button onClick={() => handleAddAlbumToQueue(album.id)}>
                <img
                    src={album.images[0].url}
                    className="now-playing__cover" alt=""
                    width="300px"
                    height="300px"
                />
            </Button>
        )
    }

    return (
        <>
            <Grid className="container">
                <Grid>
                    {getAlbumGrid()}
                </Grid>
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
                            width="400px"
                            height="400px"
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
                            style={{
                                borderRadius: 8
                            }}
                        >
                            &lt;&lt;
                        </Button>

                        <Button 
                            className="btn-spotify" 
                            onClick={() => { player.togglePlay() }} 
                            variant="outlined"
                            style={{
                                margin: "0 20px",
                                height: "60px",
                                width: "150px",
                                borderRadius: 8
                                
                            }}
                        >
                            {is_paused ? "PLAY" : "PAUSE"}
                        </Button>

                        <Button 
                            className="btn-spotify" 
                            onClick={() => { player.nextTrack() }} 
                            variant="outlined"
                            style={{
                                borderRadius: 8
                            }}
                        >
                            &gt;&gt;
                        </Button>
                    </Grid>
                    <Button onClick={() => handleAddAlbumToQueue("7w5rD7XcQufZshgBmTjDIJ")}>Add album to queue</Button>
                    <Button onClick={() => handleSearchAlbums("")}>Search albums</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default WebPlayback
