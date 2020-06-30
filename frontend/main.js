function test(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var audioElement = new Audio(this.responseText);
	  audioElement.volume = 0.1;
	  audioElement.play();
    }
  };
  xhttp.open("GET", "http://localhost:3000/", true);
  xhttp.send();
}