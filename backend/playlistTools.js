const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//TODO change system to retrieve each track individually (to handle multiple artists) and store into a Track object
module.exports = {
    async loadPlaylist(playlistId) {
        var xhttp = new XMLHttpRequest();
        var promises = [];
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var apiResult = JSON.parse(this.responseText);
                console.log(`Loaded playlist ${apiResult.title} with ${apiResult.nb_tracks} songs.`);
                var tracks = apiResult.tracks.data;
                for (const track of tracks) {
                    promises.push(new Promise(function (resolve, reject) {
                        var trackXhr = new XMLHttpRequest();
                        var trackResult;
                        trackXhr.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                var trackResult = JSON.parse(this.responseText);
                                console.log(`Loaded track ${trackResult.title} with ${trackResult.contributors.length} contributor(s).`);
                                trackResult = new Track(trackResult);
                                resolve(trackResult);
                            }
                        };
                        trackXhr.open("GET", "https://api.deezer.com/track/" + track.id, true);
                        trackXhr.send();
                    }));
                }
            }
        };
        xhttp.open("GET", "https://api.deezer.com/playlist/" + playlistId, false);
        xhttp.send();
        var result;
        await Promise.all(promises).then(function (tracks) {
            result = tracks;
        });
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
        for (const track of list) {
            let duplicate = false;
            for (const existingTrack of tracklist) {
                if (existingTrack.id == track.id) {
                    duplicate = true;
                }
            }
            if (!duplicate) {
                tracklist.push(track);
            }
        }
    }
};

function Track(track) {
    this.id = track.id;
    this.title = track.title;
    this.parsedSongTitle = parseSongName(track.title);
    this.preview = track.preview;
    this.image = track.album.cover;
    this.link = track.link;
    this.contributors = [];
    this.parsedContributors = [];
    for (let i = 0; i < track.contributors.length; i++) {
        this.addContributor(track.contributors[i].name);
    }
}
Track.prototype.addContributor = function (contributorName) {
    this.contributors.push(contributorName);
    this.parsedContributors.push(parseArtistName(contributorName));
}

function parseSongName(title) {
    var newtitle = title.trim();
    newtitle = newtitle.toLowerCase();
    newtitle = newtitle.replace(/\([^()]*\)/g, '');
    newtitle = newtitle.replace(/[^a-zA-Z0-9]/g, "");
    newtitle = newtitle.replace(" ", "");
    return newtitle;
}

function parseArtistName(name) {
    var newname = name.trim();
    newname = newname.toLowerCase();
    newname = newname.replace("é", "e");
    newname = newname.replace(/[^a-zA-Z0-9]/g, "");
    newname = newname.replace(" ", "");
    return newname;
}