
let socket = io();

socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
}




function preload() {

}

function setup() {

}

function draw() {
  ellipse(mouseX, mouseY, 30);
}
