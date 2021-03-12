//server variables
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "https://messageriesnap.herokuapp.com/",
        methods: ["GET", "POST"]
    }
});
//defines the port
const port = process.env.PORT || 3000;


let users = [];
let messages = [];
let writers = [];
let newUser;
let newGroup;
let groups = [
    {
        name: "general",
        users: [],
    }

];
let writerBool = true;
let writerBool2 = false;

//says what file to display when the server is started
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//says that the server can use the static files in the public directory
app.use(express.static('public'));

//when a user id connected
io.on('connection', (socket) => {

    //when the server receives a messsage
    socket.on('chat message', (msg) => {
        //the server emits the message to every user in the chat room
        io.in(msg["group"]).emit('chat message', msg);
        messages.push(msg);

    });

    socket.on('newGroup', group => {

        newGroup = true;
        //if the group name corresponds to an existing group
        for (let i = 0; i < groups.length; i++) {
            if (group["name"] === groups[i]["name"]) {
                newGroup = false;
                groups[i]["users"].push(users.find(user => socket['id'] === user['socketKey'])["email"])

            }
        }

        //if the group name doesnt exists
        if (newGroup) {
            //create a new group
            groups.push(group);
        }
        socket.emit('select Room with add', group);
        io.emit('draw groups', groups)

    });

    //when a user connects
    socket.on('newUser', function (user) {
        //if the user's email is not already existing
        newUser = true;
        if (!groups[0]["users"].some(userEmail => userEmail === user["email"])) {
            groups[0]["users"].push(user["email"]);
        }

        //if the user's email is already existing
        for (let i = 0; i < users.length; i++) {
            if (user["email"] === users[i]["email"]) {
                //change its data with updated ones
                users[i]["pseudo"] = user["pseudo"];
                users[i]["socketKey"] = user["socketKey"];
                users[i]["online"] = user["online"];
                newUser = false;
            }
        }
        //creates a new user
        if (newUser) {
            users.push(user);
        }
        //emits the user and group list
        socket.emit('users', users);
        socket.emit('draw groups', groups);

        //emits to every user except the sender the connected users list
        socket.broadcast.emit('connectedUsers', user);
    });



    socket.on("participants group", group => {
        console.log(group)
        console.log(groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === users[0]["email"]))
        console.log(users.filter(userIndex =>groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === userIndex["email"])))
        io.in(group).emit('participants', users.filter(userIndex =>groups[groups.findIndex(groupIndex => groupIndex["name"] === group)]["users"].find(userEmail => userEmail === userIndex["email"])));
    });

    //when a user leave the grouop
    socket.on('quit group', (group) => {
        socket.leave(group);
    });


    socket.on('choice group', (group) => {
        socket.join(group);
        console.log(groups[groups.findIndex((room) => room["name"] === group)]["users"]);
        console.log(users.find(user => socket['id'] === user['socketKey'])["email"])
        console.log(groups[groups.findIndex((room) => room["name"] === group)]["users"].some(userEmail => userEmail === users.find(user => socket['id'] === user['socketKey'])["email"]))

        if (!groups[groups.findIndex((room) => room["name"] === group)]["users"].some(userEmail => userEmail === users.find(user => socket['id'] === user['socketKey'])["email"])) {
            groups[groups.findIndex((room) => room["name"] === group)]["users"].push(users.find(user => socket['id'] === user['socketKey'])["email"])
        }

        let groupMessages = messages.filter(message => message["group"] === group);
        socket.emit('draw old messages', groupMessages);
    });

    //when a user disconnects
    socket.on('disconnect', () => {

        //if the disconnected socket correspond to a user's socket
        for (let i = 0; i < users.length; i++) {
            if (socket['id'] === users[i]['socketKey']) {
                //then the user is disconnected and emits to other users his deconnection
                users[i]['online'] = false;
                io.emit('disconnected', users[i]['pseudo']);

            }

            //emits the participants with updated online/offline users
            io.emit('participants', users);
        }

    });

    //when a user is writing in a room
    socket.on('writingUsers', (writerAndGroup) => {
        writerBool = true;
        //if the writer is already typing
        for (let i = 0; i < writers.length; i++) {
            if (writers[i] === writerAndGroup["writer"]) {
                writerBool = false;
            }
        }
        //if the writer wasnt already typing
        if (writerBool) {
            //add him in the writer array
            writers.push(writerAndGroup["writer"]);
        }

        //emits to the room to list of writing users
        socket.to(writerAndGroup["group"]).emit('writingUsers', writers);
    })

    socket.on('noWritingUsers', (writerAndGroup) => {
        writerBool2 = false;
        //if the writer stopped writing
        for (var i = 0; i < writers.length; i++) {
            if (writers[i] === writerAndGroup["writer"]) {
                writerBool2 = true;
            }
        }
        //remove him from the writers array
        if (writerBool2) {
            writers.splice(writerAndGroup["writer"], 1);

        }

        //emits to the group the updated writers array
        socket.to(writerAndGroup["group"]).emit('writingUsers', writers);
    })


});

//listens to the used port
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}`);
});

