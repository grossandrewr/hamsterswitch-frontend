import { useState, useEffect } from "react";
import { getDevices, transferPlayback } from "./spotifyApi";
import { deviceName } from "../constants";

export function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [current_track, setTrack] = useState(null);

  useEffect(() => {
    if (!document || !document.body) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = configurePlayer;
  }, []);

  useEffect(() => {
    const handleTransferPlayback = async () => {
      const { devices } = await getDevices(token);
      for (let i = 0; i < devices.length; i++) {
        let device = devices[i];
        if (device.name === deviceName) {
          transferPlayback(token, device.id);
        }
      }
    };
    setTimeout(handleTransferPlayback, 3000);
  }, []);

  const configurePlayer = () => {
    const player = new window.Spotify.Player({
      name: deviceName,
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });
    setPlayer(player);

    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    player.addListener("player_state_changed", (state) => {
      if (!state) {
        return;
      }

      setTrack(state.track_window.current_track);
      setPaused(state.paused);
    });

    player.connect();
  };
  return { player, is_paused, current_track };
}
