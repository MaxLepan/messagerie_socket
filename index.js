const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var users = [];
var messages = [];
var writers = [];


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
        console.log(messages);
    });

    socket.on('newUser', function (user) {

        users.push(user);

        socket.emit('users' ,users);
        console.log(users);

        socket.broadcast.emit('connectedUsers', user);


    });

    socket.on('disconnect', () => {
        for (let i = 0; i<users.length; i++){
            if (socket['id'] === users[i]['socketKey']){
                console.log(users[i]['socketKey']);
                console.log(socket['id']);
                io.emit('disconnected', users[i]['pseudo']);

            }
        }
        //console.log(socket['id']);

    });

    socket.on('writingUsers', (writer) => {
        console.log(writer);
        writerBool = true;
        for (let i =0; i<writers.length; i++){
            if (writers[i] === writer){
                console.log("test");
                writerBool = false;
            }
        }
        if (writerBool) {
            console.log("push");
            writers.push(writer);
        }

        socket.broadcast.emit('writingUsers', writers);
    })

    socket.on('noWritingUsers', (writer) => {
        console.log("il écrit pas");
        writerBool2 = false;
        for (var i =0; i<writers.length; i++){
            if (writers[i] === writer){
                writerBool2 = true;
            }
        }
        if (writerBool2) {
            console.log("splice");
            writers.splice(writer, 1);

        }

        socket.broadcast.emit('writingUsers', writers);
    })


});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

