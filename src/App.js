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
import HamsterSwitchLogo from './assets/HamsterSwitchLogo.png'

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
      style={{position: "relative"}}
    >

      {accessToken 
        ? <>
          <Grid style={{ position: "absolute", width: "250px", top: 15, left: 15 }}>
            <img
              src={HamsterSwitchLogo}
              alt="HamsterSwitch Logo"
              width="250px"
            />
          </Grid>
          <WebPlayback token={accessToken} />
        </>
        : <>
          <Grid>
            <img
              src={HamsterSwitchLogo}
              alt="HamsterSwitch Logo"
              width="400px"
            />
          </Grid>
          <Button variant="outlined" style={{borderRadius: "100px", padding: "12px 20px", marginTop: "20px"}} onClick={() => redirectToAuthCodeFlow(clientId)}>
            <Typography>Login to Spotify</Typography>
          </Button>
        </>
      }
    </Grid>
  );
}

export default App;
