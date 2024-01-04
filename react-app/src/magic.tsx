import { useState } from "react";
import { key } from "./secretkey.tsx"; 

async function getToken() {
  const clientId = "ea029b6633994c7894c87b0a528bd4fa"; 
  const clientSecret = "a8da7458355b4f9fb1a112d5bc80e148"; 
  const response = await fetch(
    "https://accounts.spotify.com/api/token", 
    {
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    }); 
  const data = await response.json(); 
  const token = data["access_token"]; 
  console.log(token); 
  return token; 
}

async function getChatGPTResponse(book: String) {
    const secret_key = key; 
    const response = await fetch(`https://api.openai.com/v1/chat/completions`,
    {
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": `Generate a playlist based on the book ${book}`
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

async function getLink() {
  const token = await getToken(); 
  const playlist_id = "0MJmxQHQgu4rcNFPbj2udN"; 
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, 
  {
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  }); 
  const data = await response.json(); 
  return data["external_urls"]["spotify"]; 
}

function extractSongs(songList: String) {
    const re = /(?<=")[^\n"]+(?=")/g; 
    console.log(songList.match(re)); 
    return songList.match(re); 
}

async function createPlaylist() {
  const playlist = fetch(`https://api.spotify.com/v1/users/{}/playlists`)
}

export default function Recommendations() {
  const [link, setLink] = useState('');
  const [book, setBook] = useState(''); 
  const [clicked, setClicked] = useState(false); 

  async function handleOnClick() {
    let x = document.cookie; 
    console.log(x); 
    const playlistLink = await getLink(); 
    setLink(playlistLink); 

    var bookList = await getChatGPTResponse(book); 
    bookList = extractSongs(bookList); 

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
            src="https://open.spotify.com/embed/playlist/0MJmxQHQgu4rcNFPbj2udN?utm_source=generator" 
            width="100%" 
            height="352" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
        <a href={link}>link</a>
        </div>
        : ''}
      </div>
    </div>
    </>
  );
}