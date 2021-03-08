const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var users = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Public/index.html');
});

app.use(express.static('/Public'));

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('newUser', function (user) {
    users.push(user);

    socket.emit('users' ,users);
});
