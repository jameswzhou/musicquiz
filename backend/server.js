const http = require('http');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fs = require('fs');

const consoleCheats = true;

var tracklist = [];
shuffleTracks();
var playlists = fs.readFileSync('playlists.txt', 'utf8').split();
var processedPlaylists = 0;
for(let k = 0; k < playlists.length; k++){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var apiResult = JSON.parse(this.responseText);
			console.log("\nLoaded playlist " + apiResult.title + " with " + apiResult.nb_tracks + " songs.");
			for(let i = 0; i < apiResult.tracks.data.length; i++){
				let duplicate = false;
				for(let j = 0; j < tracklist.length; j++){
					if(tracklist[j].id == apiResult.tracks.data[i].id){
						duplicate = true;
					}
				}
				if(!duplicate){
					tracklist.push(apiResult.tracks.data[i]);
					console.log("Added " + apiResult.tracks.data[i].title + " to the song pool.");
				}
			}
		}
		processedPlaylists++;
	};
	xhttp.open("GET", "https://api.deezer.com/playlist/" + playlists[k], true);
	xhttp.send();
}

function shuffleTracks(){
	if(typeof playlists === 'undefined' || processedPlaylists < playlists.length){
		setTimeout(shuffleTracks, 1000);
	}
	if(tracklist == 0){
		return;
	}
	for(let i = tracklist.length - 1; i > 0; i--){
		let j = Math.floor(Math.random() * (i + 1));
		[tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
	}
	console.log(`Shuffled ${tracklist.length} tracks.`);
	if(consoleCheats){
		for(let i = 0; i < tracklist.length; i++){
			console.log(`>${tracklist[i].title}`);
		}
	}
}

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
	response.writeHead(200, {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin' : '*',
		'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
	});
	response.end('https://cdns-preview-8.dzcdn.net/stream/c-840ed62a497746762716dd503386d476-5.mp3');
	console.log(request);
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/\n`);
});