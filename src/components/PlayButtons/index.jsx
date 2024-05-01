import React from 'react';
import Grid from '@mui/material/Grid';

import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PauseCircle from '@mui/icons-material/PauseCircle';

const PlayButtons = ({ player, is_paused }) => {
  return (
    <Grid
      item
      container
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      height="60px"
      xs={6}
      style={{
        paddingRight: "24px",
        minWidth: "300px"
      }}
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
              : <PauseCircle style={{ fontSize: 60 }} />
          }
        </IconButton>
      </Grid>
      <Grid container style={{ alignItems: "center", justifyContent: "center", height: "70px", width: "70px" }}>
        <IconButton onClick={() => { player.nextTrack() }}>
          <SkipNextIcon style={{ fontSize: 50 }} />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default PlayButtons
