let socket = io();
emitter.setMaxListeners();

let mic;
let sum = 0;
let totalscore = 0;
let players = 0;
let id;
let prec_totalscore = 0;
let timer = 0;
let otherX_players;
let otherH_players;

let myOtherPlayers = [];


socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
  id = socket.id;

  //quando ti connetti mandi il tuo Id agli altri
  socket.emit('idPlayerConnected', socket.id);

}


// ask for permissions on iOS
function touchEnded(event) {
  // check that those functions exist // if they exist it means we are //on iOS and we request the permissions
  if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    DeviceOrientationEvent.requestPermission()
  }
}


//rimuove l'oggetto del player disconnesso dall'array
socket.on("idPlayerDisconnected", removeIdPlayersDisconnected);

function removeIdPlayersDisconnected(idPlayerDisconnected) {

  for (let p = 0; p < myOtherPlayers.length; p++) {
    if (idPlayerDisconnected === myOtherPlayers[p].getId()) {
      myOtherPlayers.splice(p, 1);
    }
  }

}


//riceve la lista di Id e crea i giocatori
socket.on("idPlayerConnectedBroadcast", createOtherPlayer);

function createOtherPlayer(idOtherPlayer) {

  for (let k = 0; k < idOtherPlayer.length; k++) {

    //non crea un doppione del giocatore locale
    if (idOtherPlayer[k] !== id) {
      let newPlayer = new OtherPlayer(idOtherPlayer[k], 0, 0);
      myOtherPlayers.push(newPlayer);

      // console.log("id da classe " +myOtherPlayers[0].id);
    }
  }
}

//others_micvolume acquisisce id, volume e X

socket.on('micvolume_in', others_micvolume);

function others_micvolume(data) {

  otherX_players = data.x;
  otherH_players = data.h;

  //riceve i dati info_p e li associa agli Id corrispondenti
  for (let i = 0; i < myOtherPlayers.length; i++) {

    if (data.id === myOtherPlayers[i].getId()) {

      myOtherPlayers[i].h = data.h;
      myOtherPlayers[i].x = data.x;

    }

  }


  // ellipse(data.x, data.h + 25, 50, 50);
  // sum = 0;
  // sum += data.h;
  // console.log("somma " + sum);
  // console.log("data "+ data + " " + frameCount);
}



socket.on("players", show_players);

function show_players(n_players) {
  players = n_players;
  console.log("giocatori connessi: " + players);
}



//highscore aggiornato secondo la somma ricevuta dal server
socket.on('highscore', highscore);

function highscore(datahighscore) {
  totalscore = datahighscore;
}


function preload() {}



let yPlayer;

let starsOne = [];
let numStarsOne = 300;

let starsTwo = [];
let numStarsTwo = 100;

function setup() {

  frameRate(50);



  createCanvas(windowWidth, windowHeight);

  yPlayer = height;

  userStartAudio();
  // Create an Audio input
  mic = new p5.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();

  for (let p = 0; p < numStarsOne; p++) {

    let newStarOne = new StarsOne();
    starsOne.push(newStarOne);

  }

  for (let q = 0; q < numStarsTwo; q++) {

    let newStarTwo = new StarsTwo();
    starsTwo.push(newStarTwo);

  }


}


//variabile per prova visualizzazione sfondo
let positionRect = 0;
let maxVol = 0.1;
let easing = 0.05;
let calibrationButton = true;
let button;
let startCalibration = false;
let varTimeout;

let vel = 0;

function draw() {





  textAlign(CENTER);


  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();


  // maxVol = max(maxVol, vol);

  console.log("questo max vol : " + maxVol);



  // // Draw an ellipse with height based on volume
  let h = map(vol, 0, maxVol, height, 0);


  let targetY = h;
  let dy = targetY - yPlayer;
  yPlayer += dy * easing;



  //rotazione del giroscopio
  const widthY = map(rotationY, -90, 90, 0, width);



  // //prova visualizzazione sfondo
  //   positionRect += (totalscore - prec_totalscore)*10;
  //
  //   if(positionRect > height){
  //     positionRect = 0;
  //   }
  //
  //   rect(320, positionRect , 10, 100);
  // //fine prova

console.log("vel 1 " + vel);

  if(prec_totalscore !== 0){

    vel = totalscore - prec_totalscore;

  }


console.log("vel 2 " + vel);


  background(0);

  for (let p = 0; p < numStarsOne; p++) {

    starsOne[p].display();
    starsOne[p].move();

  }



    for (let q = 0; q < numStarsTwo; q++) {

      starsTwo[q].display();
      starsTwo[q].move();

    }



  push();

  fill(127);
  stroke(0);

  text(vel, width / 2, 200);

  text(totalscore, width / 2, 100);

  // console.log(totalscore - prec_totalscore);

  prec_totalscore = totalscore;

  ellipse(widthY, yPlayer - 25, 50, 50);


  // ellipse(otherX_players, otherH_players + 25, 50, 50);
  // console.log(otherX_players + "  " + otherH_players);

  pop();

  for (let j = 0; j < myOtherPlayers.length; j++) {

    myOtherPlayers[j].display();
    // console.log(myOtherPlayers[j].h + "  " + myOtherPlayers[j].x);

  }



  let info_p = {

    id: id,
    h: yPlayer,
    x: widthY,
    vol: vol

  }

  socket.emit('micvolume', info_p);



  //CALIBRAZIONE MICROFONO

  if (calibrationButton) {

    push();

    fill("red");
    rect(0, 0, width, height);

    button = createButton("Calibra Mic");
    button.position(width / 2, height / 2);
    button.mousePressed(calibrationMicrophone);
    button.show();

    pop();

  }

  if (startCalibration) {
    maxVol = max(maxVol, vol);
  }


}


function calibrationMicrophone() {
  startCalibration = true;
  varTimeout = setTimeout(timerCalibration, 3000);
}


function timerCalibration() {
  startCalibration = false;
  calibrationButton = false;
}


class OtherPlayer {

  constructor(id, x, h) {
    this.id = id;
    this.h = h;
    this.x = x;
  }

  display() {
    push();
    fill(127);
    stroke(0);

    ellipse(this.x, this.h + 25, 50, 50);
    pop();
  }

  getId() {
    return this.id;
  }

}



class StarsOne {

  constructor() {

    this.r = 2;
    this.x = random(0, width);
    this.y = random(0, height);
    // console.log("y " + this.y);
  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r, this.r);
    pop();
    // console.log("y display" + this.y);

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
      // console.log("y 2 " + this.y);
    } else {
      this.y += vel;
      // console.log("y 3 " + this.y);
    }
  }

}





class StarsTwo {

  constructor() {

    this.r = 5;
    this.x = random(0, width);
    this.y = random(0, height);
    // console.log("y " + this.y);
  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r, this.r);
    pop();
    // console.log("y display" + this.y);

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
      // console.log("y 2 " + this.y);
    } else {
      this.y += vel*3;
      // console.log("y 3 " + this.y);
    }
  }

}
