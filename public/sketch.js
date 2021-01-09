let socket = io();

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


//---------QUANDO SI CONNETTE MANDA L'ID DEL GIOCATORE LOCALE AL SERVER-----------

socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
  id = socket.id;

  //quando ti connetti mandi il tuo Id agli altri
  socket.emit('idPlayerConnected', socket.id);

}


//----------------PERMESSI IOS--------------

function touchEnded(event) {
  // check that those functions exist // if they exist it means we are //on iOS and we request the permissions
  if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    DeviceOrientationEvent.requestPermission()
  }
}


//----------RIMUOVE L'OGGETTO DEL PLAYER SCOLLEGATO-----------

socket.on("idPlayerDisconnected", removeIdPlayersDisconnected);

function removeIdPlayersDisconnected(idPlayerDisconnected) {

  for (let p = 0; p < myOtherPlayers.length; p++) {
    if (idPlayerDisconnected === myOtherPlayers[p].getId()) {
      myOtherPlayers.splice(p, 1);
    }
  }

}


//----------RICEVE LISTA ID DEGLI ALTRI GIOCATORI, PER OGNUNO CREA UN OGGETTO DELLA CLASSE--------------

socket.on("idPlayerConnectedBroadcast", createOtherPlayer);

function createOtherPlayer(idOtherPlayer) {

  for (let k = 0; k < idOtherPlayer.length; k++) {

    //non crea un doppione del giocatore locale
    if (idOtherPlayer[k] !== id) {
      let newPlayer = new OtherPlayer(idOtherPlayer[k], 0, 0);
      myOtherPlayers.push(newPlayer);
      }

  }

}


//-----------ACQUISISCE INFO DEGLI ALTRI PLAYER E LI ASSEGNA CIASCUNO AD UN ELEMENTO DELLA CLASSE---------

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

}


//-------RICEVE QUANTI GIOCATORI SONO CONNESSI-----------

socket.on("players", show_players);

function show_players(n_players) {
  players = n_players;
  console.log("giocatori connessi: " + players);
}



//-----------HIGHSCORE (aggiornato secondo la somma ricevuta dal server)----------

socket.on('highscore', highscore);

function highscore(datahighscore) {
  totalscore = datahighscore;
}




let yPlayer;

let starsOne = [];
let numStarsOne = 300; //quante stelle 1 creare

let starsTwo = [];
let numStarsTwo = 100; //quante stelle 2 creare


function setup() {

  frameRate(60);
  createCanvas(windowWidth, windowHeight);


//----------AUDIO INPUT, MICROFONO---------

  userStartAudio();
  // Create an Audio input
  mic = new p5.AudioIn();
  // start the Audio Input.  By default, it does not .connect() (to the computer speakers)
  mic.start();



  yPlayer = height; // posizione inizale player (parte in basso)



//----------CREA LE STELLE-----------

  for (let p = 0; p < numStarsOne; p++) {
    let newStarOne = new StarsOne();
    starsOne.push(newStarOne);
  }

  for (let q = 0; q < numStarsTwo; q++) {
    let newStarTwo = new StarsTwo();
    starsTwo.push(newStarTwo);
  }


}



let maxVol = 0.1;
let easing = 0.05;
let calibrationButton = true;
let button;
let startCalibration = false;
let varTimeout;

let vel = 0;



function draw() {


  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();

  console.log("questo max vol : " + maxVol);

  let h = map(vol, 0, maxVol, height, 0);

  //----------EASE PER FLUIDITA' MOVIMENTI-------------

  let targetY = h;
  let dy = targetY - yPlayer;
  yPlayer += dy * easing;



  //----------ROTAZIONE DEL GIROSCOPIO--------------

  const widthY = map(rotationY, -90, 90, 0, width);


  //----------VELOCITA' PER SFONDO PARALLASSE--------

  if(prec_totalscore !== 0){
    vel = totalscore - prec_totalscore;
  }

  prec_totalscore = totalscore; //tiene in memoria l'highscore precedente per
  //ricavare il cambiamento complessivo di volumi di tutti i giocatori




  background(0);


  //----------DISPLAY STELLE SFONDO PARALLASSE--------

  for (let p = 0; p < numStarsOne; p++) {
    starsOne[p].display();
    starsOne[p].move();
  }


    for (let q = 0; q < numStarsTwo; q++) {
      starsTwo[q].display();
      starsTwo[q].move();
    }



  push();

  textAlign(CENTER);
  fill(127);
  stroke(0);

  text(vel, width / 2, 200);

  text(totalscore, width / 2, 100);



  ellipse(widthY, yPlayer - 25, 50, 50);

  pop();


  //---------MOSTRA ALTRI GIOCATORI------------
  for (let j = 0; j < myOtherPlayers.length; j++) {
    myOtherPlayers[j].display();
    }


  //--------PARAMETRI PASSATI DEL GIOCATORE AL SERVER----------
  let info_p = {

    id: id,
    h: yPlayer,
    x: widthY,
    vol: vol

  }

  socket.emit('micvolume', info_p);



//------------CALIBRAZIONE MICROFONO----------------

  if (calibrationButton) {

    push();

    fill("red");
    rect(0, 0, width, height);

    button = createButton("Calibra Mic");

    button.position(width / 2, height / 2);
    button.mousePressed(calibrationMicrophone);

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


//-----------CLASSE PER ALTRI GIOCATORI-----------

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


//-----------CLASSE PER STELLE SFONDO PARALLASSE----------

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
