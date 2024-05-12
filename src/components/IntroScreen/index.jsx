import React  from 'react';
import Grid from '@mui/material/Grid'; 
import { Typography } from '@mui/material';

import SearchBar from '../SearchBar/index.jsx';


const IntroScreen = ({
  searchString,
  searchText,
  handleChangeText,
  handleSearchAlbums,
  requestRandomAlbums,
  isLoading,
  progressText
}) => {

  return (
    <>
    {
      isLoading 
      ? <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: "800px", width: "100vw" }}
      >
        <l-quantum
          size="140"
          speed="3"
          color="black"
        ></l-quantum>
        <Typography style={{marginTop: "40px"}}>{progressText}</Typography>
      </Grid>
      : <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: "800px", width: "100vw" }}
      >
        <Typography variant="h4"> What do you want to listen to?</Typography>
        <Typography variant="h6">Try something like "Psychedelic rock from the 70s"</Typography>
        <Typography variant="h6">or "Jazz albums with Max Roach on the drums"</Typography>
        <SearchBar
          searchString={searchString}
          searchText={searchText}
          handleChangeText={handleChangeText}
          handleSearchAlbums={handleSearchAlbums}
          requestRandomAlbums={requestRandomAlbums}
        />
      </Grid>
    }
    </>
  )
}

export default IntroScreen
