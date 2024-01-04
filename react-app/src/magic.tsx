import { useState } from "react";
import { key, clientId, clientSecret } from "./secretkey.tsx"; 

// async function getToken() {
//   const response = await fetch(
//     "https://accounts.spotify.com/api/token", 
//     {
//       body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       },
//       method: "POST"
//     }); 
//   const data = await response.json(); 
//   const token = data["access_token"]; 
//   console.log(token); 
//   return token; 
// }

// async function getLink(playlistID: string) {
//   const token = await getToken(); 
//   const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, 
//   {
//     headers: {
//       "Authorization": `Bearer ${token}`,
//     }
//   }); 
//   const data = await response.json(); 
//   return data["external_urls"]["spotify"]; 
// }

async function getChatGPTResponse(book: String) {
    const secret_key = key; 
    const response = await fetch(`https://api.openai.com/v1/chat/completions`,
    {
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": `Generate a playlist based on the book ${book}, song name first`
                }
            ]
        }), 
        headers: {
            "Authorization": `Bearer ${secret_key}`,
            "Content-type": "application/json"            
        },
        method: "POST"
    } 
    )
    console.log(`Generate a playlist based on the book "${book}"`)
    const data = await response.json(); 
    console.log(data["choices"][0]["message"]["content"]); 
    return data["choices"][0]["message"]["content"]; 
}

async function searchSpotify(artist: string, song: string) {
  const testlink = 
  `https://api.spotify.com/v1/search?q=remaster%2520track%3A${encodeURIComponent(song)}%2520artist%3A${encodeURIComponent(artist)}&type=track`
  const accessToken = getAccessTokenFromCookies(); 
  const response = await fetch(testlink, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  })
  const data = await response.json(); 
  console.log(data["tracks"]["items"][0]["uri"])
  return data["tracks"]["items"][0]["uri"]; 
}

async function processSearches(artistList: string[], songList: string[]) {
  const playlistID = await createPlaylist(); 
  for (let i = 0; i < songList.length; i++) {
    const songURI = await searchSpotify(artistList[i], songList[i]); 
    addSong(songURI, playlistID); 
  }
  return playlistID; 
}

function addSong(songURI: string, playlistID: string) {
  const accessToken = getAccessTokenFromCookies(); 
  fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
  {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }, 
    body: JSON.stringify({
      "uris": [`${songURI}`]
    }), 
    method: "POST"
  }
  )
}

function extractArtists(songList: string) {
  const re = /(?<=(" by )|(" - )|(" – )|(" from ))[^\n-]+/g; 
  console.log(songList.match(re)); 
  return songList.match(re);
}

function extractSongs(songList: string) {
  const re = /(?<=[0-9]. ")[^\n"]+(?=")/g; 
  console.log(songList.match(re)); 
  return songList.match(re); 
}

async function createPlaylist() {
  const accessToken = getAccessTokenFromCookies(); 
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists`, 
  {
    body: JSON.stringify({
      "name": "New Playlist",
      "description": "Made with Bookify", 
      "public": false,
    }), 
    headers: {
      "Authorization": `Bearer ${accessToken}`, 
      "Content-Type": "application/json"
    }, 
    method: "POST",
  })
  const data = await response.json(); 
  return data["id"]
  }
  catch (error) {
    console.log(error); 
  }
}

async function getAccessTokenFromRefresh() {
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].includes('refresh_token')) {
      const refreshToken = cookies[i].substring(15);
      const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    document.cookie = `refresh_token=${response.refresh_token}`
    document.cookie = `access_token=${response.access_token}`
    return response.access_token; 
    }
  }
}

function getAccessTokenFromCookies() {
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].includes('access_token')) {
      return cookies[i].substring(14);
    }
  }
  return getAccessTokenFromRefresh(); 
}

export default function Recommendations() {
  const [book, setBook] = useState(''); 
  const [clicked, setClicked] = useState(false); 
  const [ID, setID] = useState(''); 

  function IDtoLink(id: string) {
    return "https://open.spotify.com/embed/playlist/"+ id + "?utm_source=generator"
  }


  async function handleOnClick() {
    // let x = document.cookie; 
    // console.log(x); 

    var bookList = await getChatGPTResponse(book); 
    var artistList = extractArtists(bookList); 
    var songList = extractSongs(bookList); 
    if (artistList && songList) {
      const playlistID = await processSearches(artistList, songList); 
      setID(playlistID); 
    }

    setClicked(true); 
  }

  return (
    <>
      <div>  
      <input type="text" value={book} onChange={(e) => setBook(e.target.value)}/><br/>
      <button onClick={handleOnClick}>generate magic playlist</button>
      <div id="song-list"></div>
      <div>
        {clicked ? 
        <div>
        <iframe 
            src={IDtoLink(ID)}
            width="100%" 
            height="352" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
        </div>
        : ''}
      </div>
    </div>
    </>
  );
}