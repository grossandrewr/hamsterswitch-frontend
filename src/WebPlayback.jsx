import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { getAlbumInfo, playAlbum, searchForAlbum } from './auth.js'
import { makeGPTRequest } from './openai.js';
import TextField from '@mui/material/TextField';

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
    const [currentScreen, setCurrentScreen] = useState(0);
    const [searchString, setSearchString] = useState("")

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
    
    const handlePlayAlbum = async (albumId) => {
        await playAlbum(props.token, `spotify:album:${albumId}`)
        setCurrentScreen(0)
    }

    const handleSearchAlbums = async (searchString) => {
        const constantAlbumsToFind = await handleGptRequest(searchString)
        
        const results = []
        for (let i = 0; i < 4; i++) {
            const albumName = constantAlbumsToFind[i]['album'];
            const artistName = constantAlbumsToFind[i]['artist'];
            const albumResult = await searchForAlbum(props.token, albumName, artistName);
            results.push(albumResult)
        }
        setAlbumResults(results)
        setCurrentScreen(1)
        setSearchString("")
    }

    const handleGptRequest = async (searchString) => {
        const gptResult = await makeGPTRequest(searchString);
        const gptAlbums = gptResult?.message?.content;
        return JSON.parse(gptAlbums);
    }


    const getAlbumGrid = () => {
        if (!albumResults.length) return null
        return albumResults.map(album => 
            <Button onClick={() => handlePlayAlbum(album.id)}>
                <img
                    src={album.images[0].url}
                    className="now-playing__cover" alt=""
                    width="300px"
                    height="300px"
                    style={{ 
                        borderRadius: "5px",
                        boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.4)"
                    }}
                />
            </Button>
        )
    }

    const handleChangeText = e => {
        setSearchString(e.target.value);
    }

    return (
        <>
            <Grid className="container">
                { currentScreen == 1 ? 
                    <Grid container direction="column" alignItems="center" justifyContent="center">
                        <Grid container direction="column" alignItems="center" justifyContent="center">
                            <TextField
                                id="outlined-controlled"
                                label="Controlled"
                                value={searchString}
                                onChange={handleChangeText}
                                style={{minWidth: "400px"}}
                            />
                            <Button 
                                variant="outlined" 
                                style={{
                                    maxWidth: "100px", 
                                    borderRadius: 100,
                                    margin: "6px 0"
                                }}
                                onClick={() => handleSearchAlbums(searchString)}
                            >
                                OK
                            </Button>
                        </Grid>
                        <Grid container alignItems="center" justifyContent="center" style={{maxWidth: "750px"}}>
                            {getAlbumGrid()}
                        </Grid>
                    </Grid>
                    : <Grid 
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
                                style={{ 
                                    borderRadius: "5px",
                                    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.2)"
                                }}

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
                                    borderRadius: 100
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
                                    borderRadius: 100,
                                    
                                }}
                            >
                                {is_paused ? "PLAY" : "PAUSE"}
                            </Button>

                            <Button 
                                className="btn-spotify" 
                                onClick={() => { player.nextTrack() }} 
                                variant="outlined"
                                style={{
                                    borderRadius: 100,
                                }}
                            >
                                &gt;&gt;
                            </Button>
                        </Grid>
                        <Button onClick={() => handleSearchAlbums("the beatles")}>Search albums</Button>
                    </Grid>
                }
            </Grid>
        </>
    )
}

export default WebPlayback
