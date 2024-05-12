import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from './auth.js'
import { makeGPTSearchRequest, makeGPTDescriptionRequest } from './openai.js';

import { quantum } from 'ldrs'

import { genres } from './constants.js'

import AlbumsGrid from './components/AlbumGrid/index.jsx';
import MainAlbumImg from './components/MainAlbumImg/index.jsx';
import SearchBar from './components/SearchBar/index.jsx';
import ControlPanel from './components/ControlPanel/index.jsx';
import TrackInfo from './components/TrackInfo/index.jsx';
import IntroScreen from './components/IntroScreen/index.jsx';
import InfoDialog from './components/InfoDialog/index.jsx';

quantum.register()

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
  const [currentScreen, setCurrentScreen] = useState(0);
  const [searchString, setSearchString] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [progressText, setProgressText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAlbum, setDialogAlbum] = useState(undefined)

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

  const cycleProgressText = () => {
    const string1 = "Analyzing your query... "
    const string2 = "Running the algorithm... "
    const string3 = "Processing albums..."
    const string4 = "Almost ready... "

    setTimeout(() => setProgressText(string1), 0)
    setTimeout(() => setProgressText(string2), 1000)
    setTimeout(() => setProgressText(string3), 3750)
    setTimeout(() => setProgressText(string4), 6500)
  }

  const requestRandomAlbums = async () => {
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex];
    handleSearchAlbums(`albums from the genre ${randomGenre}`)
  }

  const handlePlayAlbum = async (album) => {
    await playAlbum(props.token, `spotify:album:${album.id}`)
    const albumArtUrl = album.images[0].url
    setAlbumArtUrl(albumArtUrl)
    setCurrentScreen(1)
  }

  const handleSearchAlbums = async (searchString) => {
    setIsLoading(true)
    setSearchText(searchString)
    const stringToSearch = searchString
    setSearchString("")
    cycleProgressText()
    const constantAlbumsToFind = await handleGptSearchRequest(stringToSearch)

    const results = []
    for (let i = 0; i < 4; i++) {
      const albumName = constantAlbumsToFind[i]['album'];
      const artistName = constantAlbumsToFind[i]['artist'];
      const albumResult = await searchForAlbum(props.token, albumName, artistName);
      results.push(albumResult)
    }
    setAlbumResults(results)
    setCurrentScreen(2)
    setIsLoading(false)

    const descriptionRequests = results.map((album, idx) => handleGetAlbumDescription(album, idx));
    await Promise.all(descriptionRequests);
  }

  const handleGetAlbumDescription = async (album, idx) => {
    const searchString = `${album?.name} by ${album.artists[0]?.name}`
    const description = await handleGptDescriptionRequest(searchString)

    setAlbumResults(prevResults => {
      const newAlbumResults = [...prevResults];
      newAlbumResults[idx] = { ...newAlbumResults[idx], gptDescription: description };
      return newAlbumResults;
    });
  }

  const handleGptSearchRequest = async (searchString) => {
    const response = await makeGPTSearchRequest(searchString);
    return JSON.parse(response.data);
  }
  
  const handleGptDescriptionRequest = async (searchString) => {
    const response = await makeGPTDescriptionRequest(searchString);
    return response.data
  }

  const handleChangeText = e => {
    setSearchString(e.target.value);
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setDialogAlbum(undefined)
  }

  const handleSetDialogAlbum = album => {
    setIsDialogOpen(true)
    setDialogAlbum(album)
  }


  return (
    <Grid style={{ marginTop: "15px", height: "90%", overflowY: "scroll" }}>
      {
        <Grid 
          container 
          direction="column" 
          alignItems="center" 
          justifyContent="flex-start" 
          style={{ width: "100vw", paddingTop: "30px", }}
        >
          {
            currentScreen == 0
            ? <IntroScreen
              searchString={searchString}
              searchText={searchText}
              handleChangeText={handleChangeText}
              handleSearchAlbums={handleSearchAlbums}
              requestRandomAlbums={requestRandomAlbums}
              isLoading={isLoading}
              progressText={progressText}
            />
            : currentScreen == 1
            ? <MainAlbumImg current_track={current_track} albumArtUrl={albumArtUrl} />
            : <AlbumsGrid
              isLoading={isLoading}
              albumResults={albumResults}
              handlePlayAlbum={handlePlayAlbum}
              progressText={progressText}
              setDialogAlbum={handleSetDialogAlbum}
            />
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
              ? current_track && <TrackInfo current_track={current_track}/>
              : currentScreen == 2
              ? <SearchBar
                  searchString={searchString}
                  searchText={searchText}
                  handleChangeText={handleChangeText}
                  handleSearchAlbums={handleSearchAlbums}
                  requestRandomAlbums={requestRandomAlbums}
                />
              : <></>
            }
          </Grid>
          {
            currentScreen !== 0 && !!albumArtUrl &&
            <ControlPanel
              player={player} 
              is_paused={is_paused} 
              currentScreen={currentScreen} 
              setCurrentScreen={setCurrentScreen}
              albumWasSelected={!!albumArtUrl}
            />
          }
        </Grid>
      }
      <InfoDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedAlbum={dialogAlbum}
      />
    </Grid> 
  )
}

export default WebPlayback
