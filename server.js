const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);
const users = {};

app.use(express.static(path.join(__dirname, "/public")));

io.on("connection", function(socket) {
    socket.on("newuser", function(username) {
        if (Object.values(users).includes(username)) {
            socket.emit("username_taken");
        } else {
            const message = username + " has joined the conversation.";
            console.log(message);
            socket.broadcast.emit("update", message);
            users[socket.id] = username;
            io.emit("users", Object.values(users));
        }
    });
    socket.on("exituser", function(username) {
        const message = username + " has left the conversation.";
        console.log(message);
        socket.broadcast.emit("update", message);
        delete users[socket.id];
        io.emit("users", Object.values(users));
    });
    socket.on("chat", function(message) {
        console.log(message);
        socket.broadcast.emit("chat", message);
    });
});

server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});