const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var users = [];

app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/Public/index.html');
    res.send("Test");
});

app.use(express.static('/Public'));

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('newUser', function (user) {
        console.log(users);
        users.push(user);

        socket.emit('users' ,users);

    });
});

http.listen(80, () => {
    console.log('listening on *:80');
});

