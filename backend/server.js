const http = require('http');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin' : '*',
		'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
	});
	res.end('https://cdns-preview-8.dzcdn.net/stream/c-840ed62a497746762716dd503386d476-5.mp3');
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/\n`);
});

var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('playlists.txt')
});

var tracklist = [];

lineReader.on('line', function (line) {
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
	};
	xhttp.open("GET", "https://api.deezer.com/playlist/" + line, true);
	xhttp.send();
});
