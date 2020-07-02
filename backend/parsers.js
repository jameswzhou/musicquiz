function checkSongName(title) {
    var newtitle = title.trim();
    newtitle = newtitle.toLowerCase();
    newtitle = newtitle.replace(/\([^()]*\)/g, '');
    return newtitle;
}

function checkAristName(name) {
    var newname = name.trim();
    newname = newname.toLowerCase();
    newname = newname.replace("é", "e");
    newname = newname.replace(/[^a-zA-Z0-9]/g, "");
    return newname;
}