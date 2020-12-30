let express = require('express');

let app = express();

let port = process.env.PORT || 3000;

let server = app.listen(port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.on('connection', newConnection);

function newConnection(socket){
	console.log('new connection:', socket.client.id);
}
