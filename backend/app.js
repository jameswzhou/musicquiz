const fs = require('fs');

const playlistTools = require("./playlistTools");

const consoleCheats = true;

var tracklist = [];
var playlists = fs.readFileSync('playlists.txt', 'utf8').split(' ');

for (const playlist of playlists) {
	var loadedList = playlistTools.loadPlaylist(playlist);
	loadedList.then(function (resolve) {
		playlistTools.mergeTracks(tracklist, resolve);
		playlistTools.shuffleTracks(tracklist, consoleCheats);
	});
}

const express = require('express');
const cors = require('cors');
const app = express();
const port = 25565;

var scoreboard = { roomStarted: false, currentSong: 0, currentSongFile: "", playerList: [], previousSong: {"title": "", "cover": "", "link":"", "artist": ""} };
var nameList = new Array('iAmSpeed', 'uwu', 'big pp', 'plussyfan9', 'b@tman', 'javascript time', 'we live in a society', '◔ ⌣ ◔', 'herro', 'Barack Obama');
var timer;

app.use(cors());

app.get('/scoreboard/', function (req, res) {
	res.send(JSON.stringify(scoreboard));
});

app.post('/join/', function (req, res) {
	let newPlayer = new Player(nameList[scoreboard.playerList.length], scoreboard.playerList.length);
	scoreboard.playerList.push(newPlayer);
	res.send(JSON.stringify(newPlayer));
	console.log(`${newPlayer.name} joined.`);
});

app.post('/start/', function (req, res) {
	if (!scoreboard.roomStarted) {
		scoreboard.roomStarted = true;
		console.log('Starting room.');
		scoreboard.currentSongFile = tracklist[0].preview;
		timer = setInterval(function () {
			scoreboard.previousSong.title = tracklist[scoreboard.currentSong].title;
			scoreboard.previousSong.cover = tracklist[scoreboard.currentSong].image;
			scoreboard.previousSong.link = tracklist[scoreboard.currentSong].link;
			scoreboard.previousSong.artist = tracklist[scoreboard.currentSong].contributors[0];
			scoreboard.currentSong++;
			scoreboard.currentSongFile = tracklist[scoreboard.currentSong].preview;
			for (let i = 0; i < scoreboard.playerList.length; i++) {
				scoreboard.playerList[i].solvedName = false;
				scoreboard.playerList[i].solvedArtist = false;
			}
		}, 20000);
	}
});

app.put('/guess', function (req, res) {
	let id = req.param('id');
	let guess = req.param('data');
	if (!scoreboard.playerList[id].solvedName && checkSongName(guess)) {
		scoreboard.playerList[id].solvedName = true;
		res.send('correct');
		increaseScore(id);
		return;
	}
	if (!scoreboard.playerList[id].solvedArtist && checkArtistName(guess)) {
		scoreboard.playerList[id].solvedArtist = true;
		res.send('correct');
		increaseScore(id);
		return;
	}
	res.send('incorrect');
});

app.listen(port, function () {
	console.log(`Server listening at http://localhost:${port}`);
});

function Player(name, id) {
	this.name = name;
	this.score = 0;
	this.playerId = id;
	this.solvedName = false;
	this.solvedArtist = false;
}

function checkSongName(guess) {
	return tracklist[scoreboard.currentSong].parsedSongTitle === guess;
}

function checkArtistName(guess) {
	let song = tracklist[scoreboard.currentSong];
	for (let i = 0; i < song.parsedContributors.length; i++) {
		if (song.parsedContributors[i] === guess) {
			return true;
		}
	}
	return false;
}

function increaseScore(playerId) {
	var player = scoreboard.playerList[playerId];
	player.score += 2;
	if (player.solvedName && player.solvedArtist) {
		player.score += 3;
	}
}