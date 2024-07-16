const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const initializeGameSocket = require("./game"); // Require the new module
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors({ origin: "*" }));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.use(express.static("client"));

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

initializeGameSocket(io);