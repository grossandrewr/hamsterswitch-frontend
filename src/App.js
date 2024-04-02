import './App.css';
import { 
  redirectToAuthCodeFlow,
  getAccessToken,
  fetchProfile,
 } from './auth.js'  
import WebPlayback from './WebPlayback'
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

function App() {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const [profile, setProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await getAccessToken(clientId, code);
      if (accessToken) {
        setAccessToken(accessToken)
      }
      const profileData = await fetchProfile(accessToken);
      if (profileData && profileData.email) {
        setProfile(profileData);
      }
    }

    if (profile && profile.email) {
      return;
    } else {
      fetchData();
    }
  }, [clientId, code]);
  
  return (
    <Grid
      container
      height="100vh"
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      {accessToken 
        ? <>
          <WebPlayback token={accessToken} />
        </>
        : <Button variant="outlined" onClick={() => redirectToAuthCodeFlow(clientId)}>
            <Typography variant="h3">Login</Typography>
          </Button>
      }
    </Grid>
  );
}

export default App;
