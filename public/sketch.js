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

let yRatio;


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
  otherH_players = data.h * windowHeight;

  //riceve i dati info_p e li associa agli Id corrispondenti
  for (let i = 0; i < myOtherPlayers.length; i++) {

    if (data.id === myOtherPlayers[i].getId()) {

      myOtherPlayers[i].h = otherH_players;
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


let bonusServer = false;

socket.on('bonus_effect', bonusEffect);

function bonusEffect(bonusValue) {
  console.log("dentro funzione bonusEffect");
  bonusServer = bonusValue;
}


let obstacleX = 0;

let obstacles = [];

socket.on('obstacle_x', createObstacle);

function createObstacle(obstacleXServer){

  obstacleX = obstacleXServer/1000*windowWidth;
  let newObstacle = new Obstacle(obstacleX);
  obstacles.push(newObstacle);

  // console.log("obstacleXServer " + obstacleXServer);

}



let yPlayer;

let starsOne = [];
let numStarsOne = 200; //quante stelle 1 creare

let starsTwo = [];
let numStarsTwo = 80; //quante stelle 2 creare

let starsThree = [];
let numStarsThree = 30; //quante stelle 3 creare


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

  // for (let p = 0; p < numStarsOne; p++) {
  //   let newStarOne = new StarsOne();
  //   starsOne.push(newStarOne);
  // }
  //
  // for (let q = 0; q < numStarsTwo; q++) {
  //   let newStarTwo = new StarsTwo();
  //   starsTwo.push(newStarTwo);
  // }
  //
  // for (let r = 0; r < numStarsThree; r++) {
  //   let newStarThree = new StarsThree();
  //   starsThree.push(newStarThree);
  // }



  for (let p = 0; p < numStarsOne; p++) {
    let newStarOne = new StarsOne();
    starsOne.push(newStarOne);

    if (p < numStarsTwo) {
      let newStarTwo = new StarsTwo();
      starsTwo.push(newStarTwo);
    }

    if (p < numStarsThree) {
      let newStarThree = new StarsThree();
      starsThree.push(newStarThree);
    }

  }



}



let maxVol = 0.1;
let easing = 0.05;
let calibrationButton = true;
let button;
let startCalibration = false;
let varTimeout;

let vel = 0;

let timerBonus = 0;
let checkTimer = 0;
let bonus = false;
let bonusDuration = 0;

let bx;
let by;
let collision = false;
let d;


function draw() {


  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();

  // console.log("questo max vol : " + maxVol);

  let h = map(vol, 0, maxVol, height, 0);

  let volHighscore = map(vol, 0, maxVol, 0, height);

  h = round(h); //meno numeri dopo la virgola più leggero il codice? forse, boh ci spero
  volHighscore = round(volHighscore);


  //----------EASE PER FLUIDITA' MOVIMENTI-------------

  let targetY = h;
  let dy = targetY - yPlayer;
  yPlayer += dy * easing;



  //----------ROTAZIONE DEL GIROSCOPIO--------------

  const widthY = map(rotationY, -90, 90, 0, width);


  //----------VELOCITA' PER SFONDO PARALLASSE--------

  if (prec_totalscore !== 0) {
    vel = totalscore - prec_totalscore;
  }

  prec_totalscore = totalscore; //tiene in memoria l'highscore precedente per
  //ricavare il cambiamento complessivo di volumi di tutti i giocatori


  if (!bonus) {
    background(0);
  }



  //--------------BONUSSSS---------------

  if (!startCalibration) {

    let checkBonus = 0;

    checkTimer = 0;

    for (let u = 0; u < myOtherPlayers.length; u++) {

      // console.log(myOtherPlayers[u].h);
      // console.log(u);

      if (yPlayer < myOtherPlayers[u].h + 100 && yPlayer > myOtherPlayers[u].h - 100) {

        checkBonus++;

      } else {
        checkTimer++;
        timerBonus = 0;
      }
    }

    if (checkTimer === 0) {
      timerBonus++;
    }

    if (checkBonus === myOtherPlayers.length && checkBonus != 0 && timerBonus === 120) {
      bonus = true;
      socket.emit('bonus', bonus);
      console.log("dentro condizioni giuste bonus");
      bonus = false;
    }

    if (bonusServer) {
      console.log("dentro bonus server if");

      if (bonusDuration < 50) {
        background(0, 0, 0, 50);
        vel += 10000;
      } else if(bonusDuration < 60 && bonusDuration > 50){

        background(0, 0, 0, 50);
        vel += 5000;

      } else {
        bonusServer = false;
      }

      bonusDuration++;

    } else {
      bonusDuration = 0;
    }

  }

  //----------DISPLAY STELLE SFONDO PARALLASSE--------

  if (!startCalibration) {

    for (let p = 0; p < numStarsOne; p++) {
      starsOne[p].display();
      starsOne[p].move();
    }


    for (let q = 0; q < numStarsTwo; q++) {
      starsTwo[q].display();
      starsTwo[q].move();
    }

    for (let r = 0; r < numStarsThree; r++) {
      starsThree[r].display();
      starsThree[r].move();
    }

  }



//-------------OSTACOLI-------------



for (let l = 0; l < obstacles.length; l++) {

  obstacles[l].display();
  obstacles[l].move();

  if(obstacles[l].y===(height+15)){
    obstacles[l].splice(l,1);
  }



}





  //---------MOSTRA ALTRI GIOCATORI------------
  for (let j = 0; j < myOtherPlayers.length; j++) {
    myOtherPlayers[j].display();
  }



  push();

  textAlign(CENTER);
  fill("yellow");
  stroke(0);

  text(vel, width / 2, 200);

  text(totalscore, width / 2, 100);

  text(windowHeight, width / 2, 450);

  text(displayHeight, width / 2, 500);

  pop();

  push();
  fill("yellow");
  noStroke()

  triangle(widthY - 10, yPlayer, widthY, yPlayer - 30, widthY + 10, yPlayer);

  pop();

  push();
  fill("white");
  noStroke();

  triangle(widthY - 5, yPlayer, widthY, yPlayer + random(1, 15), widthY + 5, yPlayer);

  pop();

  // ellipse(widthY, yPlayer - 40, 20, 20);



  //------------COLLISIONI-------------

  bx = widthY;
  by = yPlayer - 10;

  for(let t = 0; t < obstacles.length; t++){

    d = dist (bx, by, obstacles[t].x,obstacles[t].y);

    if(d < 20){

      collision = true;

      // obstacles[t].splice(t,1);

    }

  }


if(collision){

  console.log("collisione");

  // yPlayer += 200;

  collision = false;

}


  //--------PARAMETRI PASSATI DEL GIOCATORE AL SERVER----------

  yRatio = yPlayer / windowHeight * 100000;
  yRatio = round(yRatio);
  yRatio = yRatio / 100000;


  let info_p = {

    id: id,
    h: yRatio,
    x: widthY,
    vol: volHighscore

  }

  socket.emit('micvolume', info_p);



  //------------CALIBRAZIONE MICROFONO----------------


  if (calibrationButton) {

    push();

    fill("salmon");
    rect(0, 0, width, height);

    if (!button) {
      button = createButton("Calibra Mic");
    }

    button.position(width / 2, height / 2);

    button.mousePressed(calibrationMicrophone);

    pop();

  }

  if (startCalibration) {
    maxVol = max(maxVol, vol);
    button.remove();
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
    this.x = x;
    this.h = h;
  }

  display() {
    // push();
    // fill(127);
    // stroke(0);
    //
    // ellipse(this.x, this.h - 25, 20, 20);
    // pop();

    push();
    fill(150);
    noStroke()

    triangle(this.x - 10, this.h, this.x, this.h - 30, this.x + 10, this.h);

    pop();

    push();
    fill(200);
    noStroke();

    triangle(this.x - 5, this.h, this.x, this.h + random(1, 15), this.x + 5, this.h);

    pop();
  }

  getId() {
    return this.id;
  }

}


//-----------CLASSE PER STELLE SFONDO PARALLASSE----------

class StarsOne {

  constructor() {

    this.r = 1;
    this.x = random(0, width);
    this.y = random(0, height);

  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
    } else {
      this.y += vel / 3000;
    }
  }
}





class StarsTwo {

  constructor() {

    this.r = 2;
    this.x = random(0, width);
    this.y = random(0, height);

  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);

    } else {
      this.y += vel / 1000;
    }
  }
}




class StarsThree {

  constructor() {

    this.r = 3;
    this.x = random(0, width);
    this.y = random(0, height);
  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
      // console.log("y 2 " + this.y);
    } else {
      this.y += vel / 400;
    }
  }
}



class Obstacle {

  constructor(obstacleX) {

    this.r = 30;
    this.x = obstacleX;
    this.y = -15;

  }

  display() {

    push();
    noStroke();
    fill(255);
    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.r);
    pop();

  }


    move() {

      if (this.y > height+15) //if the star goes below the screen
      {
        // autodistruzione
      } else {
        this.y += vel/100;
      }
    }

}
