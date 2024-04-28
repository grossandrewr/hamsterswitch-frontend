import React from 'react';
import Grid from '@mui/material/Grid';

import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PauseIcon from '@mui/icons-material/Pause';

const PlayButtons = ({ player, is_paused }) => {
  return (
    <Grid
      item
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      height="50px"
      width="300px"
      style={{ position: "relative" }}
    >
      <Grid container style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px" }}>
        <IconButton onClick={() => { player.previousTrack() }}>
          <SkipPreviousIcon style={{ fontSize: 50 }} />
        </IconButton>
      </Grid>
      <Grid container direction="column" style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px" }}>
        <IconButton style={{ height: "60px", width: "60px" }} onClick={() => { player.togglePlay() }}>
          {
            is_paused
              ? <PlayCircleOutlineIcon style={{ fontSize: 60 }} />
              : <PauseIcon style={{ fontSize: 30, zIndex: 2 }} />
          }
        </IconButton>
      </Grid>
      <Grid container style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px" }}>
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
  )
}

export default PlayButtons