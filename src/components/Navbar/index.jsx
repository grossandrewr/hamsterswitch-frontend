import React from 'react';
import Grid from '@mui/material/Grid';

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AlbumIcon from '@mui/icons-material/Album';


const Navbar = ({ currentScreen, setCurrentScreen }) => {
  return (
    <Grid
      style={{
        marginTop: "30px",
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
  )
}

export default Navbar
