export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:3000/callback");
    params.append("scope", "streaming user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state");
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
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/callback");
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


export async function getAlbumTracks(token, albumUri) {
    const result = await fetch(`https://api.spotify.com/v1/albums/${albumUri}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const resultJson = await result.json()
    return {
        firstTrackName: resultJson.tracks.items[0].name,
        trackUris: resultJson.tracks.items.map(track => track.uri)
    }
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
    const result = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT", 
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 'context_uri': albumUri })
    });
}
