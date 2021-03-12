//finds the ids in the HTML
let listGroup = document.getElementById("listGroup");
let message = document.getElementById('drawMessage');
let messages = document.getElementById('messages');
let inputMessage = document.getElementById('inputMessage');
let myAccount = document.getElementById('myAccount');
let login = document.getElementById('login');
let nickname = document.getElementById('pseudo');
let email = document.getElementById('email');
let writerArea = document.getElementById('writerArea');
let onlineUsers = document.getElementById('onlineUsers');
let discussion = document.getElementById('discussion');
let connexion = document.getElementById('connexion');
let groups = document.getElementById('groups');
let titleRoom = document.getElementById('titleRoom');
let settingsIcon = document.getElementById('settingsIcon');
let addIcon = document.getElementById("addIcon")
let settings = document.getElementById('settings');
let inputSearchGroup = document.getElementById('inputSearchGroup');
let userAccount = document.getElementById('myAccount');
let userSettings = document.getElementById('userSettings');

//defines the socket
let socket = io();
//creates a hash for the email
let hash = md5(email.value);
//later used variables
let currentGroup;
let quitUserSettings;

//Draws messages sent by "me"
function myMessage(item, msg) {
    item.innerHTML = "<div>" +
        "<div class ='meSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class ='mySend'>" + msg["message"] + "</div>" +
        "</div>" +
        "<div class='pinned' style='display: none'><i class='las la-thumbtack la-thumbtack-me'></i></div>" +
        "<div><img class='image_user' src='" + msg["userImg"] + "'></div>";
}

//Draws the current chat groups
function drawRoom(currentGroup) {
    messages.innerHTML = "";
    socket.emit('choice group', currentGroup);
    discussion.style.display = "flex";
    titleRoom.innerHTML = "<h1>" + currentGroup.replace("_", " ") + "</h1>";
    socket.emit("participants group", currentGroup);
}

//Selects a room when clicked on a group
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

//draws messages sent by other users
function otherMessage(item, msg) {
    item.innerHTML = "<div><img class='image_user' src='" + msg["userImg"] + "'></div>" +
        "<div class='pinned' style='display: none'><i class='las la-thumbtack la-thumbtack-other '></i></div>" +
        "<div>" +
        "<div class = 'otherSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class = 'otherSend'>" + msg["message"] + "</div>" +
        "</div>";

}

//sends to the server the message and its informations
message.addEventListener('submit', function (e) {
    e.preventDefault();
    if (inputMessage.value) {
        socket.emit('chat message', {
            message: inputMessage.value,
            userMail: email.value,
            user: nickname.value,
            userImg: 'https://www.gravatar.com/avatar/' + hash,
            group: currentGroup
        });
        //resets the input value to nothing
        inputMessage.value = '';
        //emits the message to the server
        socket.emit('noWritingUsers', {writer: nickname.value, group: currentGroup});
    }
});

//checks if the message is sent by "me" or by other users
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

});

//checks if there is a user typing a message
socket.on('writingUsers', (writers) => {
    if (writers.length !== 0) {
        writerArea.innerHTML = "<div id ='textWriterArea'>"
        let drawArea = true;
        for (let i = 0; i < writers.length; i++) {
            if (writers[i] !== nickname.value) {
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

//draws a message in the chat when a user disconnect from the website
socket.on('disconnected', (pseudoDc) => {
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
    //sets a hash for user email
    hash = md5(email.value);
    //emits the new user information
    socket.emit('newUser', {
        pseudo: nickname.value,
        email: email.value,
        img: 'https://www.gravatar.com/avatar/' + hash,
        socketKey: socket['id'],
        online: true
    });
    //emits the user's group
    socket.emit("participants group", "general");
    //draws the user information with his PFP in the top left corner
    myAccount.innerHTML = "<div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
        "<div>" +
        "<div><h3>" + nickname.value + "</h3></div>" +
        "<div>" + email.value + "</div>" +
        "</div>"
    //changes the display of the elements of the page
    listGroup.style.display = "flex";
    myAccount.style.display = "flex";
    connexion.style.display = "none";
});

//draw old messages and messages sent when the user was disconnected
socket.on('draw old messages', (msg) => {

    for (let i = 0; i < msg.length; i++) {
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
});

//draws the different chat groups/rooms
socket.on('draw groups', (tabGroup) => {
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

    //searches in the existing groups
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

//to not create 2 groups with the same name
socket.on("select Room with add", () => {
    selectRoom();
})

//draws online and offline users
socket.on('participants', (users) => {
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

//draw a message in the chat when a user is connected
socket.on('connectedUsers', (users) => {
    let item = document.createElement('li');
    item.innerHTML = "<div class='lineConnect'></div> " +
        "<div class='textConnect'>   " + users['pseudo'] + " is connected.   </div>" +
        " <div class='lineConnect'> </div>";
    item.classList.add("messageConnect");

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

//emits the writing user informations to the server
inputMessage.addEventListener('input', () => {
    if (inputMessage.value !== '') {
        console.log(nickname.value);
        socket.emit('writingUsers', {writer: nickname.value, group: currentGroup});
    } else {
        socket.emit('noWritingUsers', {writer: nickname.value, group: currentGroup});
    }
});

//creates a new group
inputSearchGroup.addEventListener('submit', () => {
    socket.emit("newGroup", {
        name: inputSearchGroup.value.toLowerCase().replace(" ", "_"),
        users: [email.value]
    });
})

//displays the settings and connected/disconnected users list
settingsIcon.addEventListener('click', () => {
    settings.style.display = "flex";
    socket.emit("participants group", currentGroup);
    quitSettings.addEventListener('click', () => {
        settings.style.display = 'none';
    })
});

//creates a new group when the "plus" icon is clicked
addIcon.addEventListener('click', () => {
    socket.emit("newGroup", {
        name: inputSearchGroup.value.toLowerCase().replace(" ", "_"),
        users: [email.value]
    });
});

//displays the user settings
userAccount.addEventListener('click', () => {
    userSettings.style.display = 'flex';
    userSettings.querySelector("img").src = "https://www.gravatar.com/avatar/" + hash + "s=300"
    document.querySelector("#pseudoUser").innerHTML = nickname.value;
    document.querySelector("#emailUser").innerHTML = email.value;

    //hides the user settings when the "arrow" icon is clicked
    quitUserSettings = document.getElementById('quitUserSettings');

    quitUserSettings.addEventListener('click', () => {
        userSettings.style.display = 'none';
    })
})

//pins a message when clicked on
messages.addEventListener('click', (e) => {
    e.stopPropagation();

    e.target.querySelector('.pinned').style.display = 'flex';

})