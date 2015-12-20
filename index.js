const r = require("rethinkdb");
const express = require("express");
const bluebird = require("bluebird");
const bodyParser = require("body-parser");
const co = require("co");
const socketIO = require("socket.io");
const http = require("http");

const EventEmitter = require("events").EventEmitter;

const app = express();
const server = http.createServer(app);

const io = socketIO(server);

const rethink = require("./lib/rethink");

const todo = require("./lib/todo");

if (app.get("env") == "development") {
  var config = require("./config")();
}


app.use("/",express.static(__dirname + "/public"));
app.use("/bower_components", express.static(__dirname + "/bower_components"));

app.use(bodyParser.json());

app.set("views", __dirname + "/views");
app.set("view engine", "jade");

// creating a connection with rethinkdb
app.use(rethink.createConnection);

app.get("/todo/get", todo.get);
app.post("/todo/create", todo.create);
app.post("/todo/update", todo.update);
app.post("/todo/delete", todo.delete);
// app.post("/todo/stream", todo.stream);

// closing the connection with rethinkdb
app.use(handleError)
app.use(rethink.closeConnection);


// error handling middleware
function handleError(error, req, res, next) {
  res
    .status(500)
    .json({message: error.message});
}

listenExpress();

function listenExpress() {
  var PORT = process.env.PORT || 3000
  var HOST = process.env.HOST || "0.0.0.0"
  server.listen(PORT, HOST, function (error) {
    if (!error) {
      console.log(`server is listening on ${HOST}:${PORT}`)
    }
  })

}

// socket io stream
io.on("connection", function (socket) {
  todoEvents.on("change", function (data) {
    socket.emit("change", data);
  })
})

r.connect(config.rethinkdb, function (error, connection) {
  r.table("todos").changes().run(connection,function (error, cursor) {
    if (error) {
      console.error(error);
    }
    cursor.each(function (error, result) {
      if (!error) {
        todoEvents.emit("change", result);
      }
    })
  })
})


var todoEvents = new EventEmitter();

// nobody is using me from using a little bit of co...
// co(function* () {
//   try {
//     var connection = yield r.connect(config.rethinkdb);
//     try {
//       var result = yield r.table('todos').indexWait('createdAt').run(connection);
//       console.log("ta")
//     }
//     catch (error) {
//
//     }
//   }
//   catch (error) {
//     console.log("Connection to the database not established");
//   }
// })
