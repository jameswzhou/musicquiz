const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//TODO change system to retrieve each track individually (to handle multiple artists) and store into a Track object
module.exports = {
    loadPlaylist(playlistId) {
        var xhttp = new XMLHttpRequest();
        var result = [];
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var apiResult = JSON.parse(this.responseText);
                console.log(`Loaded playlist ${apiResult.title} with ${apiResult.nb_tracks} songs.`);
                var tracks = apiResult.tracks.data;
                for (let i = 0; i < tracks.length; i++) {
                    result.push(loadTrack(tracks[i].id));
                }
            }
        };
        xhttp.open("GET", "https://api.deezer.com/playlist/" + playlistId, false);
        xhttp.send();
        return result;
    },
    shuffleTracks(tracklist, consoleCheats) {
        for (let i = tracklist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
        }
        console.log(`Shuffled ${tracklist.length} tracks.`);
        if (consoleCheats) {
            for (let i = 0; i < tracklist.length; i++) {
                console.log(`>${tracklist[i].title}`);
            }
        }
    },
    mergeTracks(tracklist, list) {
        for (let i = 0; i < list.length; i++) {
            let duplicate = false;
            for (let j = 0; j < tracklist.length; j++) {
                if (tracklist[j].id == list[i].id) {
                    duplicate = true;
                }
            }
            if (!duplicate) {
                tracklist.push(list[i]);
            }
        }
    }
};

function loadTrack(trackId) {
    var trackXhr = new XMLHttpRequest();
    var result;
    trackXhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var trackResult = JSON.parse(this.responseText);
            console.log(`Loaded track ${trackResult.title} with ${trackResult.contributors.length} contributor(s).`);
            result = new Track(trackResult);
        }
    };
    trackXhr.open("GET", "https://api.deezer.com/track/" + trackId, false);
    trackXhr.send();
    return result;
}

function Track(track) {
    this.id = track.id;
    this.title = track.title;
    this.parseSongTitle = parseSongName(this.name);
    this.preview = track.preview;
    this.image = track.album.cover;
    this.link = track.link;
    this.contributors = [];
    this.parsedContributors = [];
    for(let i = 0; i < track.contributors.length; i++){
        this.addContributor(track.contributors[i].name);
    }
}
Track.prototype.addContributor = function (contributorName) {
    this.contributors.push(contributorName);
    this.parsedContributors.push(parseArtistName(contributorName));
}

function parseSongName(name) {
    return name;
}

function parseArtistName(name) {
    return name;
}