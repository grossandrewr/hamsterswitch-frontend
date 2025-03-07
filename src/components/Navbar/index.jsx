import React from "react";
import Grid from "@mui/material/Grid";

import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import AlbumIcon from "@mui/icons-material/Album";

const Navbar = ({ currentScreen, setCurrentScreen }) => {
  return (
    <Grid
      item
      container
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      height="60px"
      xs={6}
      style={{
        paddingLeft: "24px",
        borderLeft: "3px solid grey",
      }}
    >
      <IconButton
        onClick={() => setCurrentScreen(1)}
        style={{
          marginRight: "10px",
          color: currentScreen === 1 ? "#FFA500" : "grey",
        }}
      >
        <AlbumIcon style={{ fontSize: 50 }} />
      </IconButton>
      <IconButton
        onClick={() => setCurrentScreen(2)}
        style={{
          color: currentScreen === 2 ? "#FFA500" : "grey",
        }}
      >
        <SearchIcon style={{ fontSize: 50 }} />
      </IconButton>
    </Grid>
  );
};

export default Navbar;
