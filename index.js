const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "https://messageriesnap.herokuapp.com/",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3000;

var users = [];
var messages = [];
var writers = [];
var newUser;
var newGroup;
var groups = [
    {
        name: "general",
        users: [],
    }

];
var writerBool = true;
var writerBool2 = false;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {


    socket.on('chat message', (msg) => {
        io.in(msg["group"]).emit('chat message', msg);
        messages.push(msg);

    });

    socket.on('newGroup', group => {

        newGroup = true;

        for (let i = 0; i < groups.length; i++) {
            if (group["name"] === groups[i]["name"]) {
                newGroup = false;
                groups[i]["users"].push(users.find(user => socket['id'] === user['socketKey'])["email"])
                console.log(groups[i]['users']);

            }
            console.log(groups[i]);
        }


        if (newGroup) {
            console.log("add room")
            groups.push(group);
        }
        socket.emit('select Room with add', group);
        io.emit('draw groups', groups)

    });

    socket.on('newUser', function (user) {

        newUser = true;
        console.log(groups[0]["users"].some(userEmail => userEmail === user["email"]))
        if (!groups[0]["users"].some(userEmail => userEmail === user["email"])) {
            groups[0]["users"].push(user["email"]);
        }


        for (let i = 0; i < users.length; i++) {
            if (user["email"] === users[i]["email"]) {
                users[i]["pseudo"] = user["pseudo"];
                users[i]["socketKey"] = user["socketKey"];
                users[i]["online"] = user["online"];
                newUser = false;
            }
        }
        if (newUser) {
            users.push(user);
        }
        socket.emit('users', users);
        socket.emit('draw groups', groups);




        socket.broadcast.emit('connectedUsers', user);
        console.log(users);

    });
    socket.on("participants group", group => {
        console.log(users)
        console.log(groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === users[0]["email"]))
        console.log(users.filter(userIndex => userIndex["email"] === groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === userIndex["email"])))
        socket.in(group).emit('participants', users.filter(userIndex => userIndex["email"] === groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === userIndex["email"])));
    })


    socket.on('quit group', (group) => {
        socket.leave(group);
    });

    socket.on('choice group', (group) => {
        socket.join(group);
        console.log(groups.findIndex((room) => room["name"] === group));
        if (groups[groups.findIndex((room) => room["name"] === group)]["users"] === users.find(user => socket['id'] === user['socketKey'])["email"]) {
            groups[groups.findIndex((room) => room["name"] === group)]["users"].push(users.find(user => socket['id'] === user['socketKey'])["email"])
        }

        let groupMessages = messages.filter(message => message["group"] === group);
        console.log(groups)
        socket.emit('draw old messages', groupMessages);
    });

    socket.on('disconnect', () => {


        for (let i = 0; i < users.length; i++) {
            if (socket['id'] === users[i]['socketKey']) {
                //console.log(users[i]['socketKey']);
                //console.log(socket['id']);
                users[i]['online'] = false;
                io.emit('disconnected', users[i]['pseudo']);

            }

            if (users[i]['online']) {
                console.log(users[i]);
            }
            io.emit('participants', users);
        }

    });

    socket.on('writingUsers', (writerAndGroup) => {
        writerBool = true;
        for (let i = 0; i < writers.length; i++) {
            if (writers[i] === writerAndGroup["writer"]) {
                writerBool = false;
            }
        }
        if (writerBool) {
            writers.push(writerAndGroup["writer"]);
        }

        socket.to(writerAndGroup["group"]).emit('writingUsers', writers);
    })

    socket.on('noWritingUsers', (writerAndGroup) => {
        writerBool2 = false;
        for (var i = 0; i < writers.length; i++) {
            if (writers[i] === writerAndGroup["writer"]) {
                writerBool2 = true;
            }
        }
        if (writerBool2) {
            writers.splice(writerAndGroup["writer"], 1);

        }

        socket.to(writerAndGroup["group"]).emit('writingUsers', writers);
    })


});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}`);
});

