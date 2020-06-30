const http = require('http');
const fs = require('fs');

const playlistTools = require("./playlistTools");

const consoleCheats = true;

var tracklist = [];
var playlists = fs.readFileSync('playlists.txt', 'utf8').split();
for (let k = 0; k < playlists.length; k++) {
	var list = playlistTools.loadPlaylist(playlists[k]);
	playlistTools.mergeTracks(tracklist, list)
}
playlistTools.shuffleTracks(tracklist, consoleCheats);

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => res.send('https://cdns-preview-8.dzcdn.net/stream/c-840ed62a497746762716dd503386d476-5.mp3'));

app.listen(port, function() {
	console.log(`Server listening at http://localhost:${port}`);
});