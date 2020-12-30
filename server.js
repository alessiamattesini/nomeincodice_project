let express = require('express');

let app = express();

let highscore = 0;

let port = process.env.PORT || 3000;

let server = app.listen(port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.on('connection', newConnection);

function newConnection(socket){
	console.log('new connection:', socket.client.id);
	socket.on('micvolume', micvolume_message);

	function micvolume_message (dataReceived){

		highscore += dataReceived;

		socket.broadcast.emit('micvolume_in', dataReceived);

		io.sockets.emit('highscore', highscore);



	}
}
