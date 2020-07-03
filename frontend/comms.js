const url = "http://localhost:3000/";

var playerId, roomStarted = false, currentSong;

//script to join room
function join() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            userId = response.playerId;
        }
    };
    xhr.open("POST", url + 'join/', true);
    xhr.send();
}

//script to retrieve scoreboard (run every 0.25s)
function scoreboard() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (!roomStarted && response.roomStarted) {
                roomStarted = true;
                changeSong(response.currentSongFile);
                //start room stuff (hide start button etc)
            }
            if (response.currentSongFile !== currentSong) {
                changeSong(response.currentSongFile);
            }
            for (player of response.playerList) {
                //player.score
                //player.solvedName
                //player.solvedArtist
            }
        }
    };
    xhr.open("GET", url + 'scoreboard/', true);
    xhr.send();
}

function changeSong(preview) {
    currentSong = preview;
    //stop current audio (if any), play new audio
}

//script to start game
function start() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url + 'start/', true);
    xhr.send();
}

//script to make a guess
function guess() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText === 'correct') {
                //show correct answer
            }
            else {
                //show incorrect answer
            }
        }
    };
    var guess; //get guess string
    guess = parseGuess(guess);
    xhr.open("PUT", `${url}?id=${playerId}&data=${guess}/`, true);
    xhr.send();
}

function parseGuess(guess) {
    var newguess = guess.trim();
    newguess = newguess.toLowerCase();
    newguess = newguess.replace(/\([^()]*\)/g, '');
    newguess = newguess.replace(/[^a-zA-Z0-9]/g, "");
    newguess = newguess.replace(" ", "");
    return newguess;
}