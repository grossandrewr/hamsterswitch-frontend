import React from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { ReactTyped } from "react-typed";
import { useState, useEffect } from "react";

import SearchBar from "../SearchBar/index.jsx";

const IntroScreen = ({
  searchString,
  searchText,
  handleChangeText,
  handleSearchAlbums,
  requestRandomAlbums,
  isLoading,
  progressText,
  isError,
}) => {

  const [exampleSearches, setExampleSearches] = useState([]);

  const searchList = [
    'Try "Beatles solo albums"',
    'Try "electronic music to code to"',
    'Try "sounds like J Dilla"',
    'Try "new albums with Beach Boys harmonies"',
    'Try "2000s rap"',
    'Try "albums that got a 9.0 on Pitchfork"',
    'Try "cartoon soundtracks"',
    'Try "70s highlife"',
  ];

  useEffect(() => {
    const shuffled = searchList.sort(() => Math.random() - 0.5);
    setExampleSearches(shuffled);
  }, []);

  return (
    <>
      {isLoading ? (
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: "800px", width: "100vw" }}
        >
          <l-quantum size="140" speed="3" color="black"></l-quantum>
          <Typography style={{ marginTop: "40px" }}>{progressText}</Typography>
        </Grid>
      ) : (
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: "800px", width: "100vw" }}
        >
          <Typography variant="h4"> What do you want to listen to?</Typography>
          <ReactTyped
            strings={exampleSearches}
            typeSpeed={55}
            backSpeed={45}
            backDelay={2000}
            startDelay={1000}
            fadeOut={false} 
            style={{ fontSize: "32px", marginTop: "15px", color: "#1976d2" }}
            loop
          />
          <SearchBar
            searchString={searchString}
            searchText={searchText}
            handleChangeText={handleChangeText}
            handleSearchAlbums={handleSearchAlbums}
            requestRandomAlbums={requestRandomAlbums}
            isError={isError}
          />
        </Grid>
      )}
    </>
  );
};

export default IntroScreen;
