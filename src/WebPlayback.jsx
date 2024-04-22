import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from './auth.js'
import { makeGPTRequest } from './openai.js';
import TextField from '@mui/material/TextField';
import { jelly } from 'ldrs'
import { genres } from './constants.js'

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AlbumIcon from '@mui/icons-material/Album';

jelly.register()

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
  const [currentScreen, setCurrentScreen] = useState(1);
  const [searchString, setSearchString] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  
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
    
  useEffect(() => {
    const handleTransferPlayback = async () => {
      const { devices } = await getDevices(props.token)
      for (let i=0; i < devices.length; i++) {
        let device = devices[i]
        if (device.name == "Web Playback SDK") {
          setDeviceId(device.id)
          transferPlayback(props.token, device.id)
        }
      }
    }
    setTimeout(handleTransferPlayback, 3000)
  }, [])

  const requestRandomAlbums = async () => {
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex];
    handleSearchAlbums(`albums from the genre ${randomGenre}`)
  }

  const handlePlayAlbum = async (albumId) => {
    await playAlbum(props.token, `spotify:album:${albumId}`)
    setCurrentScreen(0)
  }

  const handleSearchAlbums = async (searchString) => {
    setIsLoading(true)
    setSearchText(searchString)
    const stringToSearch = searchString
    setSearchString("")

    const constantAlbumsToFind = await handleGptRequest(stringToSearch)

    const results = []
    for (let i = 0; i < 4; i++) {
      const albumName = constantAlbumsToFind[i]['album'];
      const artistName = constantAlbumsToFind[i]['artist'];
      const albumResult = await searchForAlbum(props.token, albumName, artistName);
      results.push(albumResult)
    }
    setAlbumResults(results)
    setCurrentScreen(1)
    setIsLoading(false)
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
      <Grid container direction="column" alignItems="center" justifyContent="center" style={{ marginTop: "-50px" }}>
        { currentScreen == 1 
          ? <Grid container alignItems="center" justifyContent="center" height="700px">
            {
              !!isLoading
                ? <Grid
                  container
                  alignItems="center"
                  justifyContent="center"
                  height="624px"
                  width="624px"
                  style={{ 
                    transform: "translateY(60px)"
                  }}
                >
                  <l-jelly
                    size="220"
                    speed="2.0"
                    color="black"
                  ></l-jelly>
                </Grid>
                : <Grid direction="row" container alignItems="center" justifyContent="center" style={{ height: "624px", maxWidth: "750px" }}>
                  {getAlbumGrid()}
                </Grid>
            }
          </Grid>
          : <Grid
            container
            height="700px"
            alignItems="center"
            justifyContent="center"
          >
            {
              current_track &&
              <>
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
                  <img
                    src={current_track.album.images[0].url}
                    className="now-playing__cover" alt=""
                    width="400px"
                    height="400px"
                    style={{
                      margin: "auto",
                      marginTop: "80px",
                      borderRadius: "5px",
                      boxShadow: "-15px 15px 15px rgba(0, 0, 0, 0.3)"
                    }}
                  />
              </Grid>
            </>
            }
          </Grid>
        }
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ marginBottom: "40px", height: "40px"}}>
          {
            currentScreen == 1 
            ? searchText && <Typography variant="h6">You searched: {searchText}</Typography>
            : ( current_track && 
              <Grid container direction="column" alignItems="center" justifyContent="center">
                <Typography variant="h5">{current_track?.name}</Typography>
                <Typography variant="h6">{current_track?.album.name} -- {current_track?.artists[0]?.name}</Typography>
              </Grid>
            )
          }
        </Grid>
        { currentScreen == 1 
          ? < Grid container direction="row" alignItems="center" justifyContent="center" height="50px">
            <TextField
              id="outlined-controlled"
              label=""
              value={searchString}
              onChange={handleChangeText}
              style={{ minWidth: "400px" }}
              inputProps={{
                style: {
                  height: "60px",
                  padding: '0 14px',
                  fontSize: '23px',
                  color: "#1976d2",
                },
              }}
            />
            <Button
              variant="outlined"
              style={{
                maxWidth: "100px",
                borderRadius: 100,
                margin: "6px 8px 6px 20px"
              }}
              onClick={() => handleSearchAlbums(searchString)}
            >
              OK
            </Button>
            <Button
              variant="outlined"
              style={{
                maxWidth: "100px",
                borderRadius: 100,
                margin: "6px 0px"
              }}
              onClick={() => requestRandomAlbums(searchString)}
            >
              Random
            </Button>
          </Grid>
          : <Grid
            item
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            height="50px"
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
        }
        <Grid
          style={{
            marginTop: "50px"
          }}
        >
          <IconButton
            onClick={() => setCurrentScreen(0)}
            style={{
              marginRight: "15px",
              color: currentScreen === 0 ? '#FFA500' : "grey",
            }}
          >
            <AlbumIcon
              style={{ fontSize: 50 }}
            />
          </IconButton>
          <IconButton
            onClick={() => setCurrentScreen(1)}
            style={{
              color: currentScreen === 1 ? '#FFA500' : "grey",
            }}
          >
            <SearchIcon
              style={{ fontSize: 50 }}
            />
          </IconButton>
        </Grid>
      </Grid>
    </> 
  )
}

export default WebPlayback
