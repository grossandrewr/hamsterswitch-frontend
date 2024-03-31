import './App.css';
import { 
  redirectToAuthCodeFlow,
  getAccessToken,
  fetchProfile
 } from './auth.js'  
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

  useEffect(() => {
    if (!profile) return;
    if (profile.images[0]) {
      const profileImage = new Image(100, 100);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar").appendChild(profileImage);
      document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
  }, [profile]) 
  
  return (
    profile && profile.email ? 
      <>
        <h1>Display your Spotify profile data</h1>
        <section id="profile">
        <h2>Logged in as <span id="displayName"></span></h2>
        <span id="avatar"></span>
        <ul>
            <li>User ID: <span id="id">{profile.id}</span></li>
            <li>Email: <span id="email">{profile.email}</span></li>
            <li>Spotify URI: <a id="uri" href={profile.external_urls.spotify}></a></li>
            <li>Link: <a id="url" href={profile.href}>{profile.href}</a></li>
            <li>Profile Image: <span id="imgUrl"></span></li>
        </ul>
        </section>
      </>
      : <Button onClick={() => redirectToAuthCodeFlow(clientId)}>Login</Button>
    

  );
}

export default App;
