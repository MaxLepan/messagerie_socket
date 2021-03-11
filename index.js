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
var newUser = false;
var groups = [
    {
        name: "General",
        users: [],
        img: ''
    },
    {
        name: "group2",
        users: [],
        img: ''
    },
    {
        name: "group3",
        users: [],
        img: ''
    },
    {
        name: "group4",
        users: [],
        img: ''
    },
    {
        name: "group5",
        users: [],
        img: ''
    },
    {
        name: "group6",
        users: [],
        img: ''
    },
    {
        name: "group7",
        users: [],
        img: ''
    },
    {
        name: "group8",
        users: [],
        img: ''
    },
    {
        name: "group9",
        users: [],
        img: ''
    },
    {
        name: "group10",
        users: [],
        img: ''
    },
    {
        name: "group11",
        users: [],
        img: ''
    },
    {
        name: "group12gfdsn gsdfnfnfgnb yjj rthjeyjeyjyk ry-yhryejhryehjryzjytrj rfysthr-yjhfdgnfd",
        users: [],
        img: ''
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

    socket.on('newUser', function (user) {

        newUser = true;

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
        io.emit('draw groups', groups);
        io.emit('participants', users);
        //console.log(users);

        socket.broadcast.emit('connectedUsers', user);
        console.log(users);

    });
    socket.on('quit group', (group) => {
        socket.leave(group);
    });

    socket.on('choice group', (group) => {
        socket.join(group);
        let groupMessages = messages.filter(message => message["group"] === group);
        console.log(groupMessages);
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

        io.to(writerAndGroup["group"]).emit('writingUsers', writers);
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

        io.to(writerAndGroup["group"]).emit('writingUsers', writers);
    })


});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}`);
});

