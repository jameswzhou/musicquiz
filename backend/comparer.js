function compareSongName(source, guess) {
    var newSource = checkSongName(source);
    var newGuess = checkSongName(guess);
    if (newSource == newGuess)
        return true;
    else
        return false;
}

function compareArtistName(source, guess) {
    var newSource = checkArtistName(source);
    var newGuess = checkArtistName(guess);
    if (newSource == newGuess)
        return true;
    else
        return false;
}