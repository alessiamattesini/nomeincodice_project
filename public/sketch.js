
let socket = io();
let mic;
let sum = 0;
let totalscore = 0;
let players = 0;
let id;
let prec_totalscore = 0;
let timer = 0;

socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
  id = socket.id;

}


socket.on("players", show_players);

function show_players(n_players){

  players = n_players;

  console.log("giocatori connessi: " + players);

}

socket.on('micvolume_in', others_micvolume);


function others_micvolume (data){
sum = 0;
ellipse(200, data + 25, 50,50);

sum += data;



// console.log("somma " + sum);
// console.log("data "+ data + " " + frameCount);

}


socket.on('highscore', highscore);

function highscore (datahighscore){

  totalscore = datahighscore;


}



function preload() {

}

function setup() {

  frameRate(50);

createCanvas(windowWidth, windowHeight);

userStartAudio();
// Create an Audio input
 mic = new p5.AudioIn();

 // start the Audio Input.
 // By default, it does not .connect() (to the computer speakers)
 mic.start();

}

function draw() {


  background(200);

  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with height based on volume
  let h = map(vol, 0, 1, 0, height);
  ellipse(width / 2, h + 25, 50, 50);
  // console.log("vol " + vol);
  // console.log("h " + h);

if (millis() >= 20+timer) {


  text(totalscore-prec_totalscore, 300, 100);

  console.log(totalscore-prec_totalscore);

  prec_totalscore = totalscore;

  timer = millis();

  }



  let info_p = {

    id : id,
    h : h

  }


  socket.emit('micvolume', info_p);

  text(totalscore, 100, 100);




}
