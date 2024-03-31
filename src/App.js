import './App.css';
import { 
  redirectToAuthCodeFlow,
  getAccessToken,
  fetchProfile
 } from './auth.js'  
import WebPlayback from './WebPlayback'
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';


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

  // useEffect(() => {
  //   if (!profile) return;
  //   if (profile.images[0]) {
  //     const profileImage = new Image(100, 100);
  //     profileImage.src = profile.images[0].url;
  //     document.getElementById("avatar").appendChild(profileImage);
  //     document.getElementById("imgUrl").innerText = profile.images[0].url;
  //   }
  // }, [profile]) 
  
  return (
    accessToken ? 
      <WebPlayback token={accessToken} /> 
      : <Button onClick={() => redirectToAuthCodeFlow(clientId)}>Login</Button>
  );
}

export default App;
