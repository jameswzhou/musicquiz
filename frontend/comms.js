const url = "http://70.77.251.191:25565/";

var playerId, roomStarted = false, currentSong;

var audioElement = document.createElement('AUDIO');
var sauce = document.createElement('source');
audioElement.appendChild(sauce);

//script to join room
function join() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            playerId = response.playerId;
        }
    };
    document.getElementById("joinButton").classList.add("hidden");
    document.getElementById("startButton").classList.remove("hidden");
    xhr.open("POST", url + 'join/', true);
    xhr.send();
    setInterval(function () { scoreboard() }, 250);
}

//script to retrieve scoreboard (run every 0.25s)
function scoreboard() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (!roomStarted && response.roomStarted) {
                roomStarted = true;
                console.log(response.currentSongFile);
                changeSong(response.currentSongFile);
                //start room stuff (hide start button etc)
                document.getElementById("guessForm").classList.remove("hidden");
                document.getElementById("startButton").classList.add("hidden");
            }
            if (response.currentSongFile !== currentSong) {
                console.log(response.currentSongFile);
                console.log(response.currentSong);
                changeSong(response.currentSongFile);
            }
            for (player of response.playerList) {
                //player.score
                //player.solvedName
                //player.solvedArtist
            }
            //update previous song using following data:
            //response.previousSong.title
            //response.previousSong.cover
            //response.previousSong.artist
            //response.previousSong.link
        }
    };
    xhr.open("GET", url + 'scoreboard/', true);
    xhr.send();
}

function changeSong(preview) {
    if (typeof audio !== 'undefined') {
        audio.pause();
    }
    currentSong = preview;
    //stop current audio (if any), play new audio
    audio = new Audio(preview);
    audio.setAttribute("muted", "true");
    audio.volume = 0.1;
    audio.play();
}

//script to start game
function start() {
    document.getElementById("startButton").classList.add("hidden");
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
                document.getElementById("message").innerHTML = "Correct!"
            }
            else {
                document.getElementById("message").innerHTML = "Incorrect!"
            }
        }
    };
    var guess = document.getElementById("guessField").value;; //get guess string
    guess = parseGuess(guess);
    xhr.open("PUT", `${url}guess?id=${playerId}&data=${guess}`, true);
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