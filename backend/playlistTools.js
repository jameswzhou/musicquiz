const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = {
    loadPlaylist(playlistId) {
        var xhttp = new XMLHttpRequest();
        var result;
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var apiResult = JSON.parse(this.responseText);
                console.log(`Loaded playlist ${apiResult.title} with ${apiResult.nb_tracks} songs.`);
                result = apiResult.tracks.data;
            }
        };
        xhttp.open("GET", "https://api.deezer.com/playlist/" + playlistId, false);
        xhttp.send();
        return result;
    },
    shuffleTracks(tracklist, consoleCheats){
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
    },
    mergeTracks(tracklist, list){
        for (let i = 0; i < list.length; i++) {
            let duplicate = false;
            for (let j = 0; j < tracklist.length; j++) {
                if (tracklist[j].id == list[i].id) {
                    duplicate = true;
                }
            }
            if (!duplicate) {
                tracklist.push(list[i]);
                console.log(`Added ${list[i].title} to the song pool.`);
            }
        }
    }
};