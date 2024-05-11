import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import PlayCircleTwoToneIcon from '@mui/icons-material/PlayCircleTwoTone';

const getAlbumGrid = (albumResults, handlePlayAlbum, setDialogAlbum, selectedAlbum, setSelectedAlbum) => {
  
  if (!albumResults.length) return null
  return albumResults.map((album, idx) =>
    {
      return (
        <Grid 
          style={{position: "relative", padding: "5px"}}
          onMouseEnter={() => setSelectedAlbum(idx)}
          onMouseLeave={() => setSelectedAlbum(null)}
        >
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
          {selectedAlbum === idx &&
            <>
              <IconButton style={{ position: "absolute", top: 5, right: 5 }} onClick={() => { setDialogAlbum(album)}}>
                <InfoTwoToneIcon style={{ fontSize: 40, color: "#FFFF99" }} />
              </IconButton>
              <IconButton 
                style={{ position: "absolute", top: 100, right: 100 }} 
                onClick={() => handlePlayAlbum(album)}
                >
                <PlayCircleTwoToneIcon style={{ fontSize: 100, color: "#FFFF99" }} />
              </IconButton>
            </> 
          }
        </Grid>
      )
    }
  )
}

const AlbumsGrid = ({ isLoading, albumResults, handlePlayAlbum, progressText, setDialogAlbum }) => {
  const [selectedAlbum, setSelectedAlbum] = useState(false);

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
            {getAlbumGrid(albumResults, handlePlayAlbum, setDialogAlbum, selectedAlbum, setSelectedAlbum)}
          </Grid>
      }
    </Grid>
  )
}

export default AlbumsGrid