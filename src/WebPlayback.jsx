import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from './auth.js'
import { makeGPTRequest } from './openai.js';

import { jelly } from 'ldrs'
import { ring2 } from 'ldrs'
import { genres } from './constants.js'

import AlbumsGrid from './components/AlbumGrid/index.jsx';
import MainAlbumImg from './components/MainAlbumImg/index.jsx';
import SearchBar from './components/SearchBar/index.jsx';
import PlayButtons from './components/PlayButtons/index.jsx';
import Navbar from './components/Navbar/index.jsx';

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
            ? <Grid direction="column">
              <Typography variant="h6" style={{ fontWeight: "bold" }}>{searchText}</Typography>
              <SearchBar
                searchString={searchString}
                handleChangeText={handleChangeText}
                handleSearchAlbums={handleSearchAlbums}
                requestRandomAlbums={requestRandomAlbums}
              />
            </Grid>
            : ( current_track && 
              <Grid container direction="column" alignItems="center" justifyContent="center">
                <Typography variant="h5" style={{fontWeight: "bold"}}>{current_track?.name}</Typography>
                <Typography variant="h6">{current_track?.album.name} • {current_track?.artists[0]?.name}</Typography>
              </Grid>
            )
          }
        </Grid>
        <PlayButtons player={player} is_paused={is_paused} />
        <Navbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}/>
      </Grid>
    </Grid> 
  )
}

export default WebPlayback
