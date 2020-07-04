const url = "http://localhost:25565/";

/* COUNTDOWN TIMER VARIABLES */
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;
const TIME_LIMIT = 20;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};
let remainingPathColor = COLOR_CODES.info.color;

var playerId, roomStarted = false, currentSong;

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

    //set html for the countdown timer
    document.getElementById("countdown").innerHTML = `
    <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining animate ${remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="time" class="base-timer__label">
      </span>
    </div>
    `;


    xhr.open("POST", url + 'join/', true);
    xhr.send();

    //guessing form submits with "enter" keypress
    var input = document.getElementById("guessField");
    console.log(input);
    input.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("submit").click();
    }});

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
                changeSong(response.currentSongFile);
                //start room stuff (hide start button etc)
                document.getElementById("startButton").classList.add("hidden");
                document.getElementById("countdown").classList.remove("hidden");
                document.getElementById("guessForm").classList.remove("hidden");
                document.getElementById("message").classList.remove("hidden");
                document.getElementById("recentsong").classList.remove("hidden");
            }
            if (response.currentSongFile !== currentSong) {
                changeSong(response.currentSongFile);
            }
            for (player of response.playerList) {
                //player.score
                //player.solvedName
                //player.solvedArtist
            }
            //update previous song display
            document.getElementById("artist").innerHTML = response.previousSong.artist;
            document.getElementById("song").innerHTML = response.previousSong.title;
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
    //reset input form
    document.getElementById("guessField").value = ""; 
    //stop current audio (if any), play new audio
    audio = new Audio(preview);
    audio.addEventListener("timeupdate", function() {
        var timer = document.getElementById("time"),
            duration = TIME_LIMIT,
            timePassed = 0;
            timerInterval = null;
            currentTime = parseInt(audio.currentTime),
            timeLeft = duration - currentTime;
        timePassed = timePassed += 1;
        setCircleDasharray();
        setRemainingPathColor(timeLeft);
        timer.innerHTML = ""+timeLeft;

        if (timePassed === 0) {
            onTimesUp();
        }}, false);

    audio.setAttribute("muted", "true");
    audio.volume = 0.1;
    audio.play();
}

//script to start game
function start() {

    //hide start/join buttons and reveal guessing fields
    document.getElementById("startButton").classList.add("hidden");
    document.getElementById("countdown").classList.remove("hidden");
    document.getElementById("guessForm").classList.remove("hidden");
    document.getElementById("message").classList.remove("hidden");
    document.getElementById("recentsong").classList.remove("hidden");

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
                document.getElementById("message").classList.remove("hidden");
                document.getElementById("message").innerHTML = "Correct!"
                setTimeout(function(){ document.getElementById("message").classList.add("hidden"); }, 3000);
            }
            else {
                document.getElementById("message").classList.remove("hidden");
                document.getElementById("message").innerHTML = "Incorrect!"
                setTimeout(function(){ document.getElementById("message").classList.add("hidden"); }, 3000);
            }
        }
    };
    var guess = document.getElementById("guessField").value;
    document.getElementById("guessField").value = ""; 
    //get guess string
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

/* COUNTDOWN TIMER FUNCTIONS */
function onTimesUp() {
  clearInterval(timerInterval);
  path = document.getElementById("base-timer-path-remaining");
  path.classList.remove("animate")
  void path.offsetWidth;

  path.classList.add("animate");
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft === 20) {
    remainingPathColor = COLOR_CODES.info.color;
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(info.color);
  }
  if (timeLeft <= alert.threshold) {
    remainingPathColor = COLOR_CODES.alert.color;
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    remainingPathColor = COLOR_CODES.warning.color;
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
