import { useState } from "react";

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

async function getGenres() {
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

export default function Home() {
  const [genres, setGenres] = useState('');
  const [clicked, setClicked] = useState(false); 

  async function handleOnClick() {
    const genreList = await getGenres(); 
    setGenres(genreList); 
    setClicked(true); 
  }

  return (
    <>
    <div>
      <button onClick={handleOnClick}>get magic playlist</button>
      <div>
        {clicked ? 
        <p>
        <iframe 
            src="https://open.spotify.com/embed/playlist/0MJmxQHQgu4rcNFPbj2udN?utm_source=generator" 
            width="100%" 
            height="352" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
        </p>
        : ''}
      </div>
    </div>
    </>
  );
}