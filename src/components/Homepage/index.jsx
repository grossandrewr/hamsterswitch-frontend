import React, { useState } from 'react';
import Grid from '@mui/material/Grid';

import { playAlbum, searchForAlbum } from '../../utils/spotifyUtils.js'
import { makeGPTSearchRequest, makeGPTDescriptionRequest } from '../../utils/openai.js';
import { cycleProgressText } from '../../utils/utils.js';
import { useSpotifyPlayer } from '../../utils/useSpotifyPlayer.js';

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

function Homepage(props) {
  const [albumArtUrl, setAlbumArtUrl] = useState("");
  const [albumResults, setAlbumResults] = useState([]);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [searchString, setSearchString] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [progressText, setProgressText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAlbum, setDialogAlbum] = useState(undefined)

  const { player, is_paused, current_track } = useSpotifyPlayer(props.token);

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
