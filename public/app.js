var listGroup = document.getElementById("listGroup");
var socket = io();
var message = document.getElementById('drawMessage');
var messages = document.getElementById('messages');
var inputMessage = document.getElementById('inputMessage');
var myAccount = document.getElementById('myAccount');
var login = document.getElementById('login');
var pseudo = document.getElementById('pseudo');
var email = document.getElementById('email');
var writerArea = document.getElementById('writerArea');
let onlineUsers = document.getElementById('onlineUsers');
var discussion = document.getElementById('discussion');
var connexion = document.getElementById('connexion');
var groups = document.getElementById('groups');
var titleRoom = document.getElementById('titleRoom');
var settingsIcon = document.getElementById('settingsIcon');
var addIcon = document.getElementById("addIcon")
var settings = document.getElementById('settings');
var currentGroup;
let inputSearchGroup = document.getElementById('inputSearchGroup');
let hash = md5(email.value);
let userAccount = document.getElementById('myAccount');
let userSettings = document.getElementById('userSettings');
let quitSetting = document.getElementById("quitSettings")

let quitUserSettings;


function myMessage(item, msg) {
    item.innerHTML = "<div>" +
        "<div class ='meSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class ='mySend'>" + msg["message"] + "</div>" +
        "</div>" +
        "<div class='pinned' style='display: none'><i class='las la-thumbtack la-thumbtack-me'></i></div>" +
        "<div><img class='image_user' src='" + msg["userImg"] + "'></div>";
}

function drawRoom(currentGroup) {
    messages.innerHTML = "";
    socket.emit('choice group', currentGroup);
    discussion.style.display = "flex";
    titleRoom.innerHTML = "<h1>" + currentGroup.replace("_", " ") + "</h1>";
    socket.emit("participants group", currentGroup);
}

function selectRoom() {
    document.querySelectorAll(".room, #addIcon").forEach(function (group) {
        group.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.id === "addIcon" && inputSearchGroup.value) {
                if (currentGroup) {
                    socket.emit('quit group', currentGroup);
                }
                currentGroup = inputSearchGroup.value.toLowerCase().replace(" ", "_")
                inputSearchGroup.value = "";
                drawRoom(currentGroup)
            } else if (e.target.id !== "addIcon") {
                if (currentGroup) {
                    socket.emit('quit group', currentGroup);
                }
                currentGroup = e.target.id;
                drawRoom(currentGroup)


            }

        })
    });
}

function otherMessage(item, msg) {
    item.innerHTML = "<div><img class='image_user' src='" + msg["userImg"] + "'></div>" +
        "<div class='pinned' style='display: none'><i class='las la-thumbtack la-thumbtack-other '></i></div>" +
        "<div>" +
        "<div class = 'otherSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class = 'otherSend'>" + msg["message"] + "</div>" +
        "</div>";

}

message.addEventListener('submit', function (e) {
    e.preventDefault();
    if (inputMessage.value) {
        socket.emit('chat message', {
            message: inputMessage.value,
            userMail: email.value,
            user: pseudo.value,
            userImg: 'https://www.gravatar.com/avatar/' + hash,
            group: currentGroup
        });
        inputMessage.value = '';
        socket.emit('noWritingUsers', {writer: pseudo.value, group: currentGroup});
        console.log(currentGroup);
        console.log("in sending message ");
    }
});

socket.on('chat message', function (msg) {
    let item = document.createElement('li');
    if (email.value === msg['userMail']) {
        myMessage(item, msg);
        item.classList.add("myMessage");
    } else {
        otherMessage(item, msg);
        item.classList.add("otherMessage");
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    document.addEventListener('click', () => {

    })

    console.log(msg);
});

socket.on('writingUsers', (writers) => {
    if (writers.length !== 0) {
        writerArea.innerHTML = "<div id ='textWriterArea'>"
        let drawArea = true;
        for (let i = 0; i < writers.length; i++) {
            if (writers[i] !== pseudo.value) {
                writerArea.innerHTML += writers[i] + ", ";
                drawArea = false;
            }

        }

        writerArea.innerHTML += " is typing... &nbsp;</div>";
        if (drawArea) {
            writerArea.innerHTML = '';
        }
    } else {
        writerArea.innerHTML = '';
    }

});

socket.on('disconnected', (pseudoDc) => {
    console.log(pseudoDc);
    let item = document.createElement('li');
    item.innerHTML = "<div class='lineConnect'></div>" +
        " <div class='textConnect'>" + pseudoDc + " is disconnected.</div> " +
        "<div class='lineConnect'> </div>";

    item.classList.add("messageConnect");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

login.addEventListener('submit', function (e) {
    e.preventDefault();
    hash = md5(email.value);
    socket.emit('newUser', {
        pseudo: pseudo.value,
        email: email.value,
        img: 'https://www.gravatar.com/avatar/' + hash,
        socketKey: socket['id'],
        online: true
    });
    socket.emit("participants group", "general");
    myAccount.innerHTML = "<div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
        "<div>" +
        "<div><h3>" + pseudo.value + "</h3></div>" +
        "<div>" + email.value + "</div>" +
        "</div>"
    listGroup.style.display = "flex";
    myAccount.style.display = "flex";
    connexion.style.display = "none";
});


socket.on('draw old messages', (msg) => {

    console.log("in draw old message ");

    for (let i = 0; i < msg.length; i++) {
        console.log(msg[i]['group']);
        let item = document.createElement('li');
        if (email.value === msg[i]['userMail']) {
            myMessage(item, msg[i]);
            item.classList.add("myMessage");
        } else {
            otherMessage(item, msg[i]);
            item.classList.add("otherMessage");
        }
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }
    messages.scrollTop = messages.scrollHeight;
    console.log("");
});

socket.on('draw groups', (tabGroup) => {
    console.log(tabGroup);
    groups.innerHTML = "";
    for (let i = 0; i < tabGroup.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div id='" + tabGroup[i]["name"] + "'>" +
            "<div ><h3 id='" + tabGroup[i]["name"] + "' class='nameRoom'>" +
            tabGroup[i]["name"].replace("_", " ") + "</h3></div>"

        item.id = tabGroup[i]["name"];
        item.classList.add("room");
        groups.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);

    }
    selectRoom();

    inputSearchGroup.addEventListener('input', () => {
        let tmp = 0;
        groups.innerHTML = "";
        tabGroup.forEach(group => {

            if (group['name'].toLowerCase().includes(inputSearchGroup.value)) {
                tmp++;
                let item = document.createElement('li');
                item.innerHTML += "<div id='" + group["name"] + "'>" +
                    "<div ><h3 id='" + group["name"] + "' class='nameRoom'>" + group["name"].replace("_", " ") + "</h3></div>"
                item.id = group["name"];
                item.classList.add("room");
                groups.appendChild(item);
                window.scrollTo(0, document.body.scrollHeight);
            }

        })
        if (tmp === 0) {
            groups.innerHTML = "<h4 id='noResult'>Aucun résultat</h4>"
        }
        selectRoom();
    })

});

socket.on("select Room with add", () => {
    console.log("selectRoom")
    selectRoom();
})


socket.on('participants', (users) => {
    console.log(users);
    onlineUsers.innerHTML = "";
    let usersOnline = users.filter(user => user["online"] === true);
    let usersOffline = users.filter(user => user["online"] === false)
    for (let i = 0; i < usersOnline.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div class='userLi'><div class='online'></div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'>" +
            "<h4>" + usersOnline[i]["pseudo"] + "</h4></div>";
        onlineUsers.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }
    for (let i = 0; i < usersOffline.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div class='userLi'><div class='offline'></div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'>" +
            "<h4>" + usersOffline[i]["pseudo"] + "</h4></div>";
        onlineUsers.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }


})

socket.on('connectedUsers', (users) => {
    let item = document.createElement('li');
    item.innerHTML = "<div class='lineConnect'></div> " +
        "<div class='textConnect'>   " + users['pseudo'] + " is connected.   </div>" +
        " <div class='lineConnect'> </div>";
    item.classList.add("messageConnect");

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

inputMessage.addEventListener('input', () => {
    console.log("typing");
    if (inputMessage.value !== '') {
        console.log(pseudo.value);
        socket.emit('writingUsers', {writer: pseudo.value, group: currentGroup});
    } else {
        socket.emit('noWritingUsers', {writer: pseudo.value, group: currentGroup});
    }
    console.log(email.value);
    console.log(hash);
});

inputSearchGroup.addEventListener('submit', () => {
    console.log("submit")
    socket.emit("newGroup", {
        name: inputSearchGroup.value.toLowerCase().replace(" ", "_"),
        users: [email.value]
    });
})

settingsIcon.addEventListener('click', () => {
    settings.style.display = "flex";
    console.log("clic icon")
    socket.emit("participants group", currentGroup);
    quitSettings.addEventListener('click', () => {
        settings.style.display = 'none';
    })
});

addIcon.addEventListener('click', () => {
    socket.emit("newGroup", {
        name: inputSearchGroup.value.toLowerCase().replace(" ", "_"),
        users: [email.value]
    });
});

userAccount.addEventListener('click', () => {
    console.log("user settings click");
    userSettings.style.display = 'flex';
    userSettings.querySelector("img").src = "https://www.gravatar.com/avatar/" + hash + "s=300"
    document.querySelector("#pseudoUser").innerHTML = pseudo.value;
    document.querySelector("#emailUser").innerHTML = email.value;


    quitUserSettings = document.getElementById('quitUserSettings');

    quitUserSettings.addEventListener('click', () => {
        userSettings.style.display = 'none';
    })
})

messages.addEventListener('click', (e) => {
    e.stopPropagation();

    console.log(e.target.querySelector('.pinned'));
    e.target.querySelector('.pinned').style.display = 'flex';


})