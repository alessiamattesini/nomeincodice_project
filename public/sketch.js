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


socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
  id = socket.id;

  //quando ti connetti mandi il tuo Id agli altri
  socket.emit('idPlayerConnected', socket.id);

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

  otherX_players = data.mouse_x;
  otherH_players = data.h;

  //riceve i dati info_p e li associa agli Id corrispondenti
  for (let i = 0; i < myOtherPlayers.length; i++) {

    if (data.id === myOtherPlayers[i].getId()) {

      myOtherPlayers[i].h = data.h;
      myOtherPlayers[i].mouse_x = data.mouse_x;

    }

  }
  // ellipse(data.mouse_x, data.h + 25, 50, 50);
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



socket.on('highscore', highscore);

function highscore(datahighscore) {
  totalscore = datahighscore;
}


function preload() {}



function setup() {

  frameRate(50);

  createCanvas(300, 600);

  userStartAudio();
  // Create an Audio input
  mic = new p5.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();

}




function draw() {

  textAlign(CENTER);

  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with height based on volume
  let h = map(vol, 0, 1, 0, height);

  // console.log("vol " + vol);
  // console.log("h " + h);

  if (millis() >= 20 + timer) {

    background("salmon");

    text(totalscore - prec_totalscore, width / 2, 200);

    text(totalscore, width / 2, 100);

    // console.log(totalscore - prec_totalscore);

    prec_totalscore = totalscore;

    ellipse(mouseX, h + 25, 50, 50);

    // ellipse(otherX_players, otherH_players + 25, 50, 50);
    // console.log(otherX_players + "  " + otherH_players);



    for (let j = 0; j < myOtherPlayers.length; j++) {

      myOtherPlayers[j].display();
      // console.log(myOtherPlayers[j].h + "  " + myOtherPlayers[j].mouse_x);

    }

    timer = millis();

  }

  let info_p = {

    id: id,
    h: h,
    mouse_x: mouseX

  }

  socket.emit('micvolume', info_p);

}


class OtherPlayer {

  constructor(id, mouse_x, h) {
    this.id = id;
    this.h = h;
    this.mouse_x = mouse_x;
  }

  display() {
    push();
    fill(127);
    stroke(0);

    ellipse(this.mouse_x, this.h + 25, 50, 50);
    pop();
  }

  getId() {
    return this.id;
  }

}
