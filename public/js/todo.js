(function () {
  var socket = io();

  socket.on("connect", function () {
    console.log("We are the real time web geeks");
  })

  
}())
