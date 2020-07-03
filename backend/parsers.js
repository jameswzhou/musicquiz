function checkSongName(title) {
    var newtitle = title.trim();
    newtitle = newtitle.toLowerCase();
    newtitle = newtitle.replace(/\([^()]*\)/g, '');
    newtitle = newtitle.replace(/[^a-zA-Z0-9]/g, "");
    newtitle = newtitle.replace(" ", "");
    return newtitle;
}



function checkArtistName(name) {
    var newname = name.trim();
    newname = newname.toLowerCase();
    newname = newname.replace("é", "e");
    newname = newname.replace(/[^a-zA-Z0-9]/g, "");
    newname = newname.replace(" ", "");
    return newname;
}