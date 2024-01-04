const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const request = require('request');


const app = express();
const port = 8888; 

app.use(cors()); 
app.use(express.json()); 


var client_id = 'ea029b6633994c7894c87b0a528bd4fa';
var client_secret = 'a8da7458355b4f9fb1a112d5bc80e148'
var redirect_uri = 'http://localhost:8888/callback';
var stateKey = "spotify_auth_state"

function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
 
    for (let i = 0; i < length; i++) {
       const randomIndex = Math.floor(Math.random() * charset.length);
       result += charset[randomIndex];
    }
 
    return result;
 }

app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state); 

    var scope = 'user-read-private playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
      );
  });

  

  app.get('/callback', function(req, res) {
    
    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (code === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
      request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
              res.cookie("access_token", body.access_token); 
              res.cookie("refresh_token", body.access_token); 

              res.redirect("http://localhost:5173/recommendations")
            }
          });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
  });