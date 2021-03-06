const url = "http://70.77.251.191:25565/";

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
      response.playerList.sort(comparePlayers);
      var list = document.getElementById("players");
      list.innerHTML = "";
      for (player of response.playerList) {
        if (player.playerId == playerId) {
          if (player.solvedName && player.solvedArtist) {
            list.innerHTML += "<b><li style = \"color:green\">" + player.score + " - " + player.name + "</li></b>";
          }
          else if (player.solvedName || player.solvedArtist) {
            list.innerHTML += "<b><li style = \"color:yellow\" >" + player.score + " - " + player.name + "</li></b>";
          }
          else {
            list.innerHTML += "<b><li>" + player.score + " - " + player.name + "</li></b>";
          }
        }
        else {
          if (player.solvedName && player.solvedArtist) {
            list.innerHTML += "<li style = \"color:green\">" + player.score + " - " + player.name + "</li>";;
          }
          else if (player.solvedName || player.solvedArtist) {
            list.innerHTML += "<li style = \"color:yellow\">" + player.score + " - " + player.name + "</li>";
          }
          else {
            list.innerHTML += "<li>" + player.score + " - " + player.name + "</li>";
          }
        }
      }
      //update previous song display
      document.getElementById("artist").innerHTML = response.previousSong.artist;
      document.getElementById("song").innerHTML = response.previousSong.title;
      document.getElementById("albumcover").innerHTML = `
          <img id="cover" src=${response.previousSong.cover}></img>
      `;
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

function comparePlayers(a, b) {
  var result = 0;
  if (a.score > b.score) {
    result = -1;
  }
  else if (a.score < b.score) {
    result = 1;
  }
  else {
    result = 0;
  }
  return result;
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
  audio.crossOrigin = "anonymous";
  audio.addEventListener("timeupdate", function () {
    var timer = document.getElementById("time"),
      duration = TIME_LIMIT,
      timePassed = 0;
    timerInterval = null;
    currentTime = parseInt(audio.currentTime),
      timeLeft = duration - currentTime;
    timePassed = timePassed += 1;
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    timer.innerHTML = "" + timeLeft;

    if (timePassed === 0) {
      onTimesUp();
    }
  }, false);

  audio.setAttribute("muted", "true");
  audio.volume = 0.1;
  displayVisual(audio);
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


function displayVisual(audio){
  console.log(audio.src);
  var context = new window.AudioContext();
  var src = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();

  var canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  var bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength); 
  
  var dataArray = new Uint8Array(bufferLength);

  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;

  var barWidth = (WIDTH / bufferLength) * 2.5;
  var barHeight;
  var x = 0;

  function renderFrame() {
    requestAnimationFrame(renderFrame);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      var r = barHeight + (25 * (4*i/bufferLength));
      var g = 0;
      var b = 250 * (4*i/bufferLength);

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }
  //audio.play();
  renderFrame();
}


//script to make a guess
function guess() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText === 'correct') {
        document.getElementById("message").classList.remove("hidden");
        document.getElementById("message").innerHTML = "Correct!"
        setTimeout(function () { document.getElementById("message").classList.add("hidden"); }, 3000);
      }
      else {
        document.getElementById("message").classList.remove("hidden");
        document.getElementById("message").innerHTML = "Incorrect!"
        setTimeout(function () { document.getElementById("message").classList.add("hidden"); }, 3000);
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
