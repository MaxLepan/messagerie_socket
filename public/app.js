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
let quitUserSettings;





function myMessage(item, msg) {
    item.innerHTML = "<div>" +
        "<div class ='meSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class ='mySend'>" + msg["message"] + "</div>" +
        "</div>" +
        "<div><img class='image_user' src='"+msg["userImg"]+"'></div>";
}

function drawRoom(currentGroup){
    messages.innerHTML = "";

    console.log("name room");
    console.log("");
    if (currentGroup){
        socket.emit('quit group', currentGroup);
    }



    socket.emit('choice group', currentGroup);
    discussion.style.display = "flex";
    titleRoom.innerHTML = "<h1>" + currentGroup + "</h1>";
}

function selectRoom() {
    document.querySelectorAll(".room, #addIcon").forEach(function (group) {
        group.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.id === "addIcon" && inputSearchGroup.value){
                currentGroup = inputSearchGroup.value
                inputSearchGroup.value ="";
                drawRoom(currentGroup)
            }else if (e.target.id !== "addIcon") {
                currentGroup = e.target.id;
                drawRoom(currentGroup)


            }

        })
    });
};

function otherMessage(item, msg) {
    item.innerHTML = "<div><img class='image_user' src='"+msg["userImg"]+"'></div>" +
        "<div>" +
        "<div class = 'otherSender'><h3>" + msg["user"] + "</h3></div>" +
        "<div class = 'otherSend'>" + msg["message"] + "</div>" +
        "</div>";

};

message.addEventListener('submit', function (e) {
    e.preventDefault();
    if (inputMessage.value) {
        socket.emit('chat message', {
            message: inputMessage.value,
            userMail: email.value,
            user: pseudo.value,
            userImg : 'https://www.gravatar.com/avatar/' + hash,
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
});

socket.on('writingUsers', (writers) => {
    if (writers.length !== 0) {
        writerArea.innerHTML = "<div id ='textWriterArea'>&nbsp;"
        for (let i = 0; i < writers.length; i++) {
            if (writers[i] !== pseudo.value) {
                writerArea.innerHTML += writers[i] + ", ";
            }

        }
        writerArea.innerHTML += " is typing... &nbsp;</div>";
    } else {
        writerArea.innerHTML = '';
    }

});

socket.on('disconnected', (pseudoDc) => {
    console.log(pseudoDc);
    let item = document.createElement('li');
    item.innerHTML = "<div class='lineConnect'></div>" +
        " <div class='textConnect'>"+pseudoDc + " is disconnected.</div> " +
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
        img: 'https://www.gravatar.com/avatar/' + hash ,
        socketKey: socket['id'],
        online: true
    });
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
    for (let i = 0; i < tabGroup.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div id='" + tabGroup[i]["name"].toLowerCase() + "'>" +
            "<img class='image_user' id='" + tabGroup[i]["name"].toLowerCase() + "' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
            "<div ><h3 id='" + tabGroup[i]["name"].toLowerCase() + "' class='nameRoom'>" + tabGroup[i]["name"] + "</h3></div>"

        item.id = tabGroup[i]["name"].toLowerCase();
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
                item.innerHTML += "<div id='" + group["name"].toLowerCase() + "'><img class='image_user' id='" + group["name"].toLowerCase() + "' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
                    "<div ><h3 id='" + group["name"].toLowerCase() + "' class='nameRoom'>" + group["name"] + "</h3></div>"
                item.id = group["name"].toLowerCase();
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

socket.on("select Room with add", () =>{
    console.log("selectRoom")
    selectRoom();
})


socket.on('participants', (users) => {
    onlineUsers.innerHTML = "";
    let usersOnline = users.filter(user => user["online"] === true);
    let usersOffline = users.filter(user => user["online"] === false);
    let item = document.createElement('li');
    item.innerHTML = "<h4>Online users</h4>";
    onlineUsers.appendChild(item);
    for (let i = 0; i < usersOnline.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
            "<div><h3>" + usersOnline[i]["pseudo"] + "</h3></div>";
        onlineUsers.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }

    item = document.createElement('li');
    item.innerHTML = "<h4>Offline users</h4>";
    onlineUsers.appendChild(item);
    for (let i = 0; i < usersOffline.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = "<div><img class='image_user' src='https://www.gravatar.com/avatar/" + hash + "'></div>" +
            "<div><h3>" + usersOffline[i]["pseudo"] + "</h3></div>";
        onlineUsers.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }


})

socket.on('connectedUsers', (users) => {
    let item = document.createElement('li');
    item.innerHTML = "<div class='lineConnect'></div> " +
        "<div class='textConnect'>   "+users['pseudo'] + " is connected.   </div>" +
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

settingsIcon.addEventListener('click', () => {
    settings.innerHTML+='<div>' +
        '<div>general settings</div>' +
        '<div>group settings</div>' +
        '</div>';
});

addIcon.addEventListener('click', () => {
    socket.emit("newGroup", {
        name : inputSearchGroup.value,
        users: [email.value]
    });
});

userAccount.addEventListener('click', () => {
    console.log("user settings click");
    userSettings.style.display = 'block';
    userSettings.innerHTML = `
    <div id="quitUserSettings">
        <i class="las la-angle-left"></i>
    </div>
    <div id="settingsImgContainer">
        <a target="_blank" rel="noopener noreferrer" href="https://fr.gravatar.com/">
            <img title="Changer de photo de profil" id="settingImg" src="https://www.gravatar.com/avatar/${hash}">
        </a>
    </div>
<div>
    <h2>${pseudo.value}</h2>
    <h3>${email.value}</h3>
    
    
</div>`

    quitUserSettings = document.getElementById('quitUserSettings');

    quitUserSettings.addEventListener('click', () => {

        userSettings.style.display = 'none';
    })
})

