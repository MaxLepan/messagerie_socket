const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var users = [];
var messages = [];
var writers = [];
var connectedUsers = [];
var newUser=false;

var writerBool = true;
var writerBool2 = false;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {



    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        messages.push(msg);

    });

    socket.on('newUser', function (user) {

        newUser=true;

        for(let i = 0;i<users.length;i++ ){
            if (user["email"] === users[i]["email"]){
                users[i]["pseudo"] = user["pseudo"];
                users[i]["socketKey"] = user["socketKey"];
                newUser=false;
            }
        }
        if (newUser){
            users.push(user);
            connectedUsers.push(user);
        }
        socket.emit('users' ,users);
        io.emit('participants', connectedUsers);
        socket.emit('draw old messages', messages)
        console.log(users);

        socket.broadcast.emit('connectedUsers', user);


    });

    socket.on('disconnect', () => {
        const index = connectedUsers.findIndex(user => user.socketKey === socket.id);

        if (index !== -1) {
            connectedUsers.splice(index, 1);
        }
        io.emit('participants', connectedUsers);

        for (let i = 0; i<users.length; i++){

            if (socket['id'] === users[i]['socketKey']){

                users[i]['online'] = false;
                io.emit('disconnected', users[i]);


                console.log(users);
            }

        }

    });

    socket.on('writingUsers', (writer) => {
        writerBool = true;
        for (let i =0; i<writers.length; i++){
            if (writers[i] === writer){
                writerBool = false;
            }
        }
        if (writerBool) {
            writers.push(writer);
        }

        socket.broadcast.emit('writingUsers', writers);
    })

    socket.on('noWritingUsers', (writer) => {
        writerBool2 = false;
        for (var i =0; i<writers.length; i++){
            if (writers[i] === writer){
                writerBool2 = true;
            }
        }
        if (writerBool2) {
            writers.splice(writer, 1);

        }

        socket.broadcast.emit('writingUsers', writers);
    })


});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

