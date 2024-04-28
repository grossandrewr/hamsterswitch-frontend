import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


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

const AlbumsGrid = ({ isLoading, albumResults, handlePlayAlbum }) => {
  return (
    <Grid container alignItems="center" justifyContent="center" height="700px">
      {
        !!isLoading
          ? <Grid
            container
            alignItems="center"
            justifyContent="center"
            height="624px"
            width="624px"
            style={{
              transform: "translateY(60px)"
            }}
          >
            <l-jelly
              size="220"
              speed="2.0"
              color="black"
            ></l-jelly>
          </Grid>
          : <Grid direction="row" container alignItems="center" justifyContent="center" style={{ height: "630px", maxWidth: "750px" }}>
            {getAlbumGrid(albumResults, handlePlayAlbum)}
          </Grid>
      }
    </Grid>
  )
}

export default AlbumsGrid