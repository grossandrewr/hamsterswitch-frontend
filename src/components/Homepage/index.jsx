import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import { playAlbum, searchForAlbum, getDevices, transferPlayback } from '../../utils/spotifyUtils.js'
import { makeGPTSearchRequest, makeGPTDescriptionRequest } from '../../utils/openai.js';
import { cycleProgressText } from '../../utils/utils.js';
import { deviceName } from '../../constants.js'

import { quantum } from 'ldrs'

import { genres } from '../../constants.js'

import AlbumsGrid from '../AlbumGrid/index.jsx';
import MainAlbumImg from '../MainAlbumImg/index.jsx';
import SearchBar from '../SearchBar/index.jsx';
import ControlPanel from '../ControlPanel/index.jsx';
import TrackInfo from '../TrackInfo/index.jsx';
import IntroScreen from '../IntroScreen/index.jsx';
import InfoDialog from '../InfoDialog/index.jsx';

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

function Homepage(props) {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  const [albumArtUrl, setAlbumArtUrl] = useState("");
  const [albumResults, setAlbumResults] = useState([]);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [searchString, setSearchString] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [progressText, setProgressText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAlbum, setDialogAlbum] = useState(undefined)

  useEffect(() => {
    if (!document || !document.body) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document && document.body && document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = configurePlayer;
  }, []);
    
  useEffect(() => {
    const handleTransferPlayback = async () => {
      const { devices } = await getDevices(props.token)
      for (let i=0; i < devices.length; i++) {
        let device = devices[i]
        if (device.name === deviceName) {
          transferPlayback(props.token, device.id)
        }
      }
    }
    setTimeout(handleTransferPlayback, 3000)
  }, [])

  const configurePlayer = () => {
    const player = new window.Spotify.Player({
      name: deviceName,
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
    cycleProgressText(setProgressText)

    const albumsToFind = await makeGPTSearchRequest(searchString)
    setSearchString("")

    const results = await Promise.all(
      albumsToFind.slice(0, 4).map(({ album, artist }) =>
        searchForAlbum(props.token, album, artist)
      )
    );

    setAlbumResults(results)
    setCurrentScreen(2)
    setIsLoading(false)

    const descriptionRequests = results.map((album, idx) => handleGetAlbumDescription(album, idx));
    await Promise.all(descriptionRequests);
  }

  const handleGetAlbumDescription = async (album, idx) => {
    const searchString = `${album?.name} by ${album.artists[0]?.name}`
    const description = await makeGPTDescriptionRequest(searchString)

    setAlbumResults(prevResults => {
      const newAlbumResults = [...prevResults];
      newAlbumResults[idx] = { ...newAlbumResults[idx], gptDescription: description };
      return newAlbumResults;
    });
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

  const requestRandomAlbums = async () => {
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex];
    handleSearchAlbums(`albums from the genre ${randomGenre}`)
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
            currentScreen === 0
            ? <IntroScreen
              searchString={searchString}
              searchText={searchText}
              handleChangeText={handleChangeText}
              handleSearchAlbums={handleSearchAlbums}
              requestRandomAlbums={requestRandomAlbums}
              isLoading={isLoading}
              progressText={progressText}
            />
            : currentScreen === 1
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
              currentScreen === 1
              ? current_track && <TrackInfo current_track={current_track}/>
              : currentScreen === 2
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

export default Homepage
