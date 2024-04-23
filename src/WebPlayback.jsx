import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from './auth.js'
import { makeGPTRequest } from './openai.js';
import TextField from '@mui/material/TextField';
import { jelly } from 'ldrs'
import { ring2 } from 'ldrs'
import { genres } from './constants.js'

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AlbumIcon from '@mui/icons-material/Album';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PauseIcon from '@mui/icons-material/Pause';

jelly.register()
ring2.register()

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
  const [albumArtUrl, setAlbumArtUrl] = useState("");
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

  const handlePlayAlbum = async (album) => {
    await playAlbum(props.token, `spotify:album:${album.id}`)
    const albumArtUrl = album.images[0].url
    setAlbumArtUrl(albumArtUrl)
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
      <Button onClick={() => handlePlayAlbum(album)}>
        <img
          src={album.images[0].url}
          className="now-playing__cover" alt=""
          width="307px"
          height="307px"
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
                : <Grid direction="row" container alignItems="center" justifyContent="center" style={{ height: "630px", maxWidth: "750px" }}>
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
                    src={albumArtUrl}
                    className="now-playing__cover" alt=""
                    width="624px"
                    height="624px"
                    style={{
                      margin: "auto",
                      borderRadius: "5px",
                      boxShadow: "-15px 15px 15px rgba(0, 0, 0, 0.3)"
                    }}
                  />
              </Grid>
            </>
            }
          </Grid>
        }
        <Grid 
          container 
          direction="column" 
          alignItems="center" 
          justifyContent="center" 
          style={{ marginBottom: "40px", height: "40px" }}
        >
          {
            currentScreen == 1 
              ? searchText && <Typography variant="h6" style={{ fontWeight: "bold" }}>{searchText}</Typography>
            : ( current_track && 
              <Grid container direction="column" alignItems="center" justifyContent="center">
                <Typography variant="h5" style={{fontWeight: "bold"}}>{current_track?.name}</Typography>
                <Typography variant="h6">{current_track?.album.name} • {current_track?.artists[0]?.name}</Typography>
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
            <IconButton onClick={() => { player.previousTrack() }}>
              <SkipPreviousIcon style={{ fontSize: 50 }}/>
            </IconButton>
            <IconButton onClick={() => { player.togglePlay() }}>
              {
                is_paused
                ? <PlayCircleOutlineIcon style={{ fontSize: 60 }} />
                : <PauseIcon style={{ padding: "13px", fontSize: 30, marginRight: "-68px", zIndex: 2 }} />
              }
            </IconButton>
            {
              !is_paused && 
              < l-ring-2
              size="52"
              stroke="5"
              stroke-length="0.25"
              bg-opacity="0.1"
              speed="1.7"
              color="grey"
              style={{marginRight: "9px", height: 60}}
              ></l-ring-2 >
            }
            <IconButton onClick={() => { player.nextTrack() }}>
              <SkipNextIcon style={{ fontSize: 50 }}/>
            </IconButton>

            
          </Grid>
        }
        <Grid
          style={{
            marginTop: "50px",
            paddingTop: "10px",
            borderTop: "1px solid #CCCCCC"
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
