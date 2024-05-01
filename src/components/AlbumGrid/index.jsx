import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';


const getAlbumGrid = (albumResults, handlePlayAlbum) => {
  if (!albumResults.length) return null
  return albumResults.map(album =>
    <Button onClick={() => handlePlayAlbum(album)}>
      <img
        src={album.images[0].url}
        className="now-playing__cover" alt=""
        width="307px"
        height="307px"
        style={{
          borderRadius: "5px",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.4)"
        }}
      />
    </Button>
  )
}

const AlbumsGrid = ({ isLoading, albumResults, handlePlayAlbum, progressText }) => {
  return (
    <Grid container alignItems="center" justifyContent="center" height="700px">
      {
        isLoading
          ? <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            height="624px"
            width="624px"
            style={{
              transform: "translateY(60px)"
            }}
          >
            <l-quantum
              size="120"
              speed="3"
              color="black"
            ></l-quantum>
            <Typography style={{marginTop: "40px"}}>{progressText}</Typography>
          </Grid>
          : <Grid direction="row" container alignItems="center" justifyContent="center" style={{ height: "630px", maxWidth: "750px" }}>
            {getAlbumGrid(albumResults, handlePlayAlbum)}
          </Grid>
      }
    </Grid>
  )
}

export default AlbumsGrid