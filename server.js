const express = require("express");
const app = express();
const server = require("http").Server(app);

const port = process.env.PORT || 3030

//uuid: creates uinque URL/ unique id for each room
const { v4: uuidv4 } = require("uuid");

//EJS: embedded js | templating lang.
app.set("view engine", "ejs");  //setting up template engine

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

//PeerJS allow us to implement WebRTC.
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.use(express.static("public"));  //to access css

app.get("/", (req, res) => {
  console.log('30 redirecting to new URL');
  res.redirect(`/${uuidv4()}`); //redirecting to new URL
});

var roomId;
//redering room.ejs
app.get("/:room", (req, res) => {
  roomId = req.params.room;
  res.render("room", { roomId: roomId });  //passing the unique room(url)

});

io.on("connection", (socket) => {
  console.log('new Websocket Connection');
  // socket.emit('roomId-passed', roomId)  //letting the user access roomId

  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    console.log('44 room joined', roomId);

    io.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });

});

server.listen(port, () => {
  console.log('server is up on port', port);
});
