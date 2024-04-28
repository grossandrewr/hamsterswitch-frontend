import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; 

const SearchBar = ({ 
  searchString,
  handleChangeText,
  handleSearchAlbums,
  requestRandomAlbums
}) => {
  return (
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
  )
}

export default SearchBar