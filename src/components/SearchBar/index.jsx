import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; 
import { Typography } from '@mui/material';

const SearchBar = ({ 
  searchString,
  searchText,
  handleChangeText,
  handleSearchAlbums,
  requestRandomAlbums
}) => {
  return (
    <Grid direction="column" align="center">
      <Typography variant="h6" style={{ fontWeight: "bold", margin: "35px 0 20px 0" }}>{searchText}</Typography>
      <Grid container direction="row" alignItems="center" justifyContent="center" height="50px">
        <TextField
          id="outlined-controlled"
          label=""
          value={searchString}
          onChange={handleChangeText}
          style={{ minWidth: "400px" }}
          inputProps={{
            style: {
              height: "60px",
              padding: '0 14px',
              fontSize: '23px',
              color: "#1976d2",
            },
          }}
        />
        <Button
          variant="outlined"
          style={{
            maxWidth: "100px",
            borderRadius: 100,
            margin: "6px 8px 6px 20px"
          }}
          onClick={() => handleSearchAlbums(searchString)}
        >
          OK
        </Button>
        <Button
          variant="outlined"
          style={{
            maxWidth: "100px",
            borderRadius: 100,
            margin: "6px 0px"
          }}
          onClick={() => requestRandomAlbums(searchString)}
        >
          Random
        </Button>
      </Grid>
    </Grid>
  )
}

export default SearchBar