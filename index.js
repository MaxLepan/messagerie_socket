const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var users = [];
var messages = [];
var writers = [];
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
        //console.log(messages);
    });

    socket.on('newUser', function (user) {
        console.log(users);
        newUser=true;
        for(let i = 0;i<users.length;i++ ){
            if (user["userMail"] === users[i]["userMail"]){
                users[i]["pseudo"] = user["pseudo"];
                users[i]["socketKey"] = user["socketKey"];
                newUser=false;
            }
        }
        if (newUser){
            users.push(user);
        }
        socket.emit('users' ,users);
        //console.log(messages);
        socket.emit('draw old messages', messages)
        console.log(users);

        socket.broadcast.emit('connectedUsers', user);


    });

    socket.on('disconnect', () => {
        console.log(users);
        for (let i = 0; i<users.length; i++){

            if (socket['id'] === users[i]['socketKey']){
                //console.log(users[i]['socketKey']);
                //console.log(socket['id']);
                users[i]['online'] = false;
                io.emit('disconnected', users[i]['pseudo']);

            }
            //if (users[i][]){

            //}
        }

    });

    socket.on('writingUsers', (writer) => {
        //console.log(writer);
        writerBool = true;
        for (let i =0; i<writers.length; i++){
            if (writers[i] === writer){
                //console.log("test");
                writerBool = false;
            }
        }
        if (writerBool) {
            //console.log("push");
            writers.push(writer);
        }

        socket.broadcast.emit('writingUsers', writers);
    })

    socket.on('noWritingUsers', (writer) => {
        //console.log("il écrit pas");
        writerBool2 = false;
        for (var i =0; i<writers.length; i++){
            if (writers[i] === writer){
                writerBool2 = true;
            }
        }
        if (writerBool2) {
            //console.log("splice");
            writers.splice(writer, 1);

        }

        socket.broadcast.emit('writingUsers', writers);
    })


});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

