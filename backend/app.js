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

var scoreboard = { roomStarted: false, currentSong: 0, currentSongFile: "", playerList: [] };
var nameList = new Array('iAmSpeed', 'uwu', 'big pp', 'plussyfan9', 'b@tman', 'javascript time', 'we live in a society', '◔ ⌣ ◔', 'herro', 'Barack Obama');
var timer;

app.use(cors());

app.get('/scoreboard/', function (req, res) {
	res.send(JSON.stringify(scoreboard));
});

app.post('/join/', function (req, res) {
	let newPlayer = new Player(nameList[scoreboard.playerList.length]);
	scoreboard.playerList.push(newPlayer);
	res.send(newPlayer.name);
	console.log(`${newPlayer.name} joined.`);
});

app.post('/start/', function (req, res) {
	if (!scoreboard.roomStarted) {
		scoreboard.roomStarted = true;
		console.log('Starting room.');
		scoreboard.currentSongFile = tracklist[scoreboard.currentSong].preview;
		for (let i = 1; i < scoreboard.playerList.length; i++) {
			scoreboard.playerList[i].solvedName = false;
			scoreboard.playerList[i].solvedArtist = false;
		}
		timer = setInterval(function () {
			scoreboard.currentSong++;
			scoreboard.currentSongFile = tracklist[scoreboard.currentSong].preview;
			for (let i = 1; i < scoreboard.playerList.length; i++) {
				scoreboard.playerList[i].solvedName = false;
				scoreboard.playerList[i].solvedArtist = false;
			}
		}, 20000);
	}
});

app.listen(port, function () {
	console.log(`Server listening at http://localhost:${port}`);
});

function Player(name) {
	this.name = name;
	this.score = 0;
	this.solvedName = false;
	this.solvedArtist = false;
}