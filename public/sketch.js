
let socket = io();
let mic;
let sum = 0;
let totalscore = 0;




socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);

}

socket.on('micvolume_in', others_micvolume);

function others_micvolume (data){

sum = 0;

ellipse(200, data + 25, 50,50);

sum += data;

// console.log("somma " + sum);
console.log("data "+ data + " " + frameCount);

}


socket.on('highscore', highscore);

function highscore (datahighscore){

 totalscore = datahighscore;

}



function preload() {

}

function setup() {

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
  socket.emit('micvolume', h);

  text(totalscore,100,100);
  text(sum + h,300,100);


}
