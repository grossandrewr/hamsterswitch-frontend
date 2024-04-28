import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from './auth.js'
import { makeGPTRequest } from './openai.js';

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

import AlbumsGrid from './components/AlbumGrid/index.jsx';
import MainAlbumImg from './components/MainAlbumImg/index.jsx';
import SearchBar from './components/SearchBar/index.jsx';

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

  const handleChangeText = e => {
    setSearchString(e.target.value);
  }

  return (
    <Grid style={{ height: "100%", overflowY: "scroll" }}>
      <Grid 
        container 
        direction="column" 
        alignItems="center" 
        justifyContent="flex-start" 
        style={{ height: "1000px", width: "100vw", paddingTop: "30px", }}
      >
        { currentScreen == 1 
          ? (
            <AlbumsGrid 
              isLoading={isLoading}
              albumResults={albumResults}
              handlePlayAlbum={handlePlayAlbum}
            />
          )
          : <MainAlbumImg current_track={current_track} albumArtUrl={albumArtUrl}/>
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
          ? <SearchBar
            searchString={searchString}
            handleChangeText={handleChangeText}
            handleSearchAlbums={handleSearchAlbums}
            requestRandomAlbums={requestRandomAlbums}
          />
          : <Grid
            item
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            height="50px"
            width="300px"
            style={{ position: "relative"}}
          > 
            <Grid container style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px"}}>
              <IconButton onClick={() => { player.previousTrack() }}>
                <SkipPreviousIcon style={{ fontSize: 50 }} />
              </IconButton>
            </Grid>
            <Grid container direction="column" style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px"}}>
              <IconButton style={{ height: "60px", width: "60px" }} onClick={() => { player.togglePlay() }}>
                {
                  is_paused
                    ? <PlayCircleOutlineIcon style={{ fontSize: 60 }} />
                    : <PauseIcon style={{ fontSize: 30, zIndex: 2 }} />
                }
              </IconButton>
            </Grid>
            <Grid container style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px"}}>
              <IconButton onClick={() => { player.nextTrack() }}>
                <SkipNextIcon style={{ fontSize: 50 }} />
              </IconButton>
            </Grid>
            {
              !is_paused &&
              <Grid
                style={{ position: "absolute", left: 125, top: 9 }}
              >
                <l-ring-2
                  size="51"
                  stroke="6"
                  stroke-length="0.3"
                  bg-opacity="0.1"
                  speed="1.7"
                  color="grey"
                ></l-ring-2 >
              </Grid>
            }
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
    </Grid> 
  )
}

export default WebPlayback
