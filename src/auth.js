export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", `${frontendUrl}/callback`);
    params.append("scope", "streaming user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", `${frontendUrl}/callback`);
    params.append("code_verifier", verifier);
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });
    const { access_token } = await result.json();
    return access_token;
}

export async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

export async function getAlbumInfo(token, albumUri) {
    const result = await fetch(`https://api.spotify.com/v1/albums/${albumUri}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const resultJson = await result.json()
    return resultJson;
}

export async function searchAlbums(token, albumUriArray) {
    const paramString = albumUriArray.join('%')
    const result = await fetch(`https://api.spotify.com/v1/albums?ids=${paramString}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const resultJson = await result.json();
    return resultJson;
}

export async function playAlbum(token, albumUri) {
    await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT", 
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 'context_uri': albumUri })
    });
}

export async function searchForAlbum(token, albumName, artistName) {
    const searchString = `q=${albumName.replace(" ", "+")}+${artistName.replace(" ", "+")}&type=album` 
    const result = await fetch(`https://api.spotify.com/v1/search?${searchString}`, {
        method: "GET", 
        headers: { Authorization: `Bearer ${token}` },
    });
    const resultJson = await result.json()
    const albumResults = resultJson.albums?.items
    return albumResults.length && albumResults[0]
}

export async function getDevices(token) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        method: "GET", 
        headers: { Authorization: `Bearer ${token}` },
    });
    const resultJson = await result.json()
    return resultJson
}

export async function transferPlayback(token, deviceId) {
    await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 'device_ids': [deviceId] })
    });
}

