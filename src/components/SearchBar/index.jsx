import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";

const SearchBar = ({
  searchString,
  searchText,
  handleChangeText,
  handleSearchAlbums,
  requestRandomAlbums,
  isError,
}) => {
  const searchTextToDisplay = searchText ? `You searched: ${searchText}` : "";
  const errorText = "An error occurred. Please try a different search.";

  return (
    <Grid direction="column" align="center">
      <Typography variant="h6" style={{ margin: "35px 0 20px 0" }}>
        {searchTextToDisplay}
      </Typography>
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        height="50px"
      >
        <TextField
          id="outlined-controlled"
          label=""
          value={searchString}
          onChange={handleChangeText}
          style={{ minWidth: "400px", transform: "translateY(10px)" }}
          error={isError}
          helperText={isError ? errorText : "\u00A0"}
          inputProps={{
            style: {
              height: "60px",
              padding: "0 14px",
              fontSize: "23px",
              color: "#1976d2",
            },
          }}
        />
        <Button
          variant="outlined"
          style={{
            maxWidth: "100px",
            borderRadius: 100,
            margin: "6px 8px 6px 20px",
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
            margin: "6px 0px",
          }}
          onClick={() => requestRandomAlbums(searchString)}
        >
          Random
        </Button>
      </Grid>
    </Grid>
  );
};

export default SearchBar;
