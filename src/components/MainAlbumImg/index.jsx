import React from 'react';
import Grid from '@mui/material/Grid'; 

const MainAlbumImg = ({current_track, albumArtUrl}) => {
  return (
    <Grid
      container
      height="700px"
      alignItems="center"
      justifyContent="center"
    >
      {
        current_track &&
        <>
          <Grid
            className="now-playing__side"
            item
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{
              margin: "14px 0",
              fontSize: "20px",
            }}
          >
            <img
              src={albumArtUrl}
              className="now-playing__cover" alt=""
              width="624px"
              height="624px"
              style={{
                margin: "auto",
                borderRadius: "5px",
                boxShadow: "-10px 5px 40px rgba(0, 0, 0, 0.3)"
              }}
            />
          </Grid>
        </>
      }
    </Grid>
  )
}

export default MainAlbumImg