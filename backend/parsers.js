function checkSongName(title) {
    var newtitle = title.trim();
    newtitle = newtitle.toLowerCase();
    var split = newtitle.split("("); 
    for (var i = 0; i < split.length; i++) {
        if (!split[i].includes("(")){
            newtitle = split[i].replace(/[^a-zA-Z0-9]/g, "");
            return newtitle;
        }
    }
    return newtitle;
}

function checkAristName(name) {
    var newname = name.trim();
    newname = newname.toLowerCase();
    newname = newname.replace("é", "e");
    newname = newname.replace(/[^a-zA-Z0-9]/g, "");
    return newname;
}