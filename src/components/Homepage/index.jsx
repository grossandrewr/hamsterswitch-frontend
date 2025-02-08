import React, { useState } from "react";
import Grid from "@mui/material/Grid";

import { playAlbum } from "../../utils/spotifyApi.js";
import { makeGPTDescriptionRequest } from "../../utils/openAIApi.js";
import {
  cycleProgressText,
  processAlbumsSearch,
} from "../../utils/utils.js";
import { useSpotifyPlayer } from "../../utils/useSpotifyPlayer.js";

import { quantum } from "ldrs";

import AlbumsGrid from "../AlbumGrid/index.jsx";
import MainAlbumImg from "../MainAlbumImg/index.jsx";
import SearchBar from "../SearchBar/index.jsx";
import ControlPanel from "../ControlPanel/index.jsx";
import TrackInfo from "../TrackInfo/index.jsx";
import IntroScreen from "../IntroScreen/index.jsx";
import InfoDialog from "../InfoDialog/index.jsx";
import { genres } from "../../constants.js";

quantum.register();

function Homepage(props) {
  const [albumArtUrl, setAlbumArtUrl] = useState("");
  const [albumResults, setAlbumResults] = useState([]);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [progressText, setProgressText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAlbum, setDialogAlbum] = useState(undefined);
  const [isError, setIsError] = useState(false);

  const { player, is_paused, current_track } = useSpotifyPlayer(props.token);

  const handlePlayAlbum = async (album) => {
    await playAlbum(props.token, `spotify:album:${album.id}`);
    const albumArtUrl = album.images[0].url;
    setAlbumArtUrl(albumArtUrl);
    setCurrentScreen(1);
  };

  const handleSearchAlbums = async (searchString) => {
    setIsLoading(true);
    setSearchText(searchString);
    setSearchString("");
    cycleProgressText(setProgressText);

    try {
      const results = await processAlbumsSearch(searchString, props.token);
      setAlbumResults(results);
      setCurrentScreen(2);
      setIsLoading(false);

      const descriptionRequests = results.map((album, idx) =>
        handleGetAlbumDescription(album, idx),
      );

      await Promise.all(descriptionRequests);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleGetAlbumDescription = async (album, idx) => {
    const searchString = `${album?.name} by ${album.artists[0]?.name}`;
    const description = await makeGPTDescriptionRequest(searchString);

    setAlbumResults((prevResults) => {
      const newAlbumResults = [...prevResults];
      newAlbumResults[idx] = {
        ...newAlbumResults[idx],
        gptDescription: description,
      };
      return newAlbumResults;
    });
  };

  const requestRandomAlbums = async () => {
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex];
    handleSearchAlbums(`albums from the genre ${randomGenre}`);
  };

  const handleChangeText = (e) => {
    setSearchString(e.target.value);
    setIsError(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogAlbum(undefined);
  };

  const handleSetDialogAlbum = (album) => {
    setIsDialogOpen(true);
    setDialogAlbum(album);
  };

  return (
    <Grid style={{ marginTop: "15px", height: "90%", overflowY: "scroll" }}>
      {
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          style={{ width: "100vw", paddingTop: "30px" }}
        >
          {currentScreen === 0 ? (
            <IntroScreen
              searchString={searchString}
              searchText={searchText}
              handleChangeText={handleChangeText}
              handleSearchAlbums={handleSearchAlbums}
              requestRandomAlbums={requestRandomAlbums}
              isLoading={isLoading}
              progressText={progressText}
              isError={isError}
            />
          ) : currentScreen === 1 ? (
            <MainAlbumImg
              current_track={current_track}
              albumArtUrl={albumArtUrl}
            />
          ) : (
            <AlbumsGrid
              isLoading={isLoading}
              albumResults={albumResults}
              handlePlayAlbum={handlePlayAlbum}
              progressText={progressText}
              setDialogAlbum={handleSetDialogAlbum}
            />
          )}
          <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ marginBottom: "40px", height: "40px" }}
          >
            {currentScreen === 1 ? (
              current_track && <TrackInfo current_track={current_track} />
            ) : currentScreen === 2 ? (
              <SearchBar
                searchString={searchString}
                searchText={searchText}
                handleChangeText={handleChangeText}
                handleSearchAlbums={handleSearchAlbums}
                requestRandomAlbums={requestRandomAlbums}
                isError={isError}
              />
            ) : (
              <></>
            )}
          </Grid>
          {currentScreen !== 0 && !!albumArtUrl && (
            <ControlPanel
              player={player}
              is_paused={is_paused}
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              albumWasSelected={!!albumArtUrl}
            />
          )}
        </Grid>
      }
      <InfoDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedAlbum={dialogAlbum}
      />
    </Grid>
  );
}

export default Homepage;
