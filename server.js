let express = require('express');

let app = express();

let highscore = 0;

let port = process.env.PORT || 3000;

let server = app.listen(port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.on('connection', newConnection);

let players = 0;

let d_player = false;

let id_players = [];





function newConnection(socket) {

  players++; //per ogni connessione aggiungo un giocatore

  io.sockets.emit("players", players);
  console.log('players:', players);


  socket.on("idPlayerConnected", broadcastId);

  function broadcastId(idPlayerConnected) {

    console.log("id da client :  " + idPlayerConnected);

    id_players.push(idPlayerConnected);

    io.sockets.emit('idPlayerConnectedBroadcast', id_players);

  }


  console.log('new connection:', socket.client.id);



  socket.on('micvolume', micvolume_message);

  function micvolume_message(dataReceived) {

    highscore += dataReceived.h;

    socket.broadcast.emit('micvolume_in', dataReceived);

    io.sockets.emit('highscore', highscore);



    socket.on('disconnect', function() {
      d_player = true;

    }); //per capire se un giocatore si disconnette; il paramentro d_player serve
    //a mantenere in memoria il fatto che qualcuno si sia disconnesso

    if (d_player) {

      players--;
      console.log('players:', players);
      d_player = false;

      io.sockets.emit("players", players);

    } // dato che la disconnessione dura più di un tick questo if esterno
    //serve  a non decrementare "players" più di una volta per ogni disconnect


  }


}
