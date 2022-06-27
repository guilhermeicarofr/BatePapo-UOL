let username = '';
let target = "Todos";
let msgType = "message";
let userping;


function refreshChat() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(renderChat);
    promise.then(console.log("Refresh chat"))
}
function renderChat(get) {
    const chat = get.data;
    document.querySelector('.chat').innerHTML = '';

    for (let i=0 ; i<chat.length ; i++) {

        switch (chat[i].type) {
            case "message":
                document.querySelector('.chat').innerHTML += `
                    <div class="msg">
                        &nbsp;
                        <span class="time">(${gmtConvert(chat[i].time)})</span>
                        &nbsp;
                        <span class="user">${chat[i].from}</span>
                        &nbsp;para&nbsp;
                        <span class="target">${chat[i].to}</span>
                        :&nbsp;
                        <span class="text">${chat[i].text}</span>
                    </div>
                `;
                break;

            case "status":
                document.querySelector('.chat').innerHTML += `
                    <div class="status">
                        &nbsp;
                        <span class="time">(${gmtConvert(chat[i].time)})</span>
                        &nbsp;
                        <span class="user">${chat[i].from}</span>
                        &nbsp;
                        <span class="text">${chat[i].text}</span>
                    </div>
                `;
                break;

            case "private_message":
                if (chat[i].to === username || chat[i].from === username)
                    document.querySelector('.chat').innerHTML += `
                        <div class="pvt-msg">
                            &nbsp;
                            <span class="time">(${gmtConvert(chat[i].time)})</span>
                            &nbsp;
                            <span class="user">${chat[i].from}</span>
                            &nbsp;reservadamente&nbsp;para&nbsp;
                            <span class="target">${chat[i].to}</span>
                            :&nbsp;
                            <span class="text">${chat[i].text}</span>
                        </div>
                    `;
                break;
        }
        document.querySelector('.chat div:last-of-type').scrollIntoView();
    }
}


function logIn(name) {
    username = name;
    console.log(`Login: ${username}`);

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",{name:username});
    promise.then(userping = setInterval(userOnline,5000)); //Especificação 5000ms
    promise.catch(invalidUser);
}
function userOnline() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status",{name:username});
    promise.then(console.log(`Online: ${username}`));
    promise.catch(invalidUser);

    if (!(document.querySelector("div.login").classList.contains("hidden")))
        document.querySelector("div.login").classList.add("hidden");
}
function invalidUser(error) {
    clearInterval(userping);
    console.log(error.response.status);
    
    if ((document.querySelector("div.login").classList.contains("hidden")))
        document.querySelector("div.login").classList.remove("hidden");
    document.querySelector("div.loading").classList.add("hidden");
    document.querySelector("div.login h2.alert").classList.remove("hidden");
    setTimeout(reloadLogIn,2000);
}


function sendMsg() {
    const text = document.querySelector('.msg-box input').value;
    console.log(`${msgType} from ${username} to ${target}: ${text}`);
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",{
        from: username,
    	to: target,
	    text: text,
	    type: msgType,
    });

    promise.then(selectAll);
    promise.then(refreshChat);
    promise.catch(failMsg);
    document.querySelector('.msg-box input').value = '';
}
function failMsg(error) {
    console.log(error.response.status);
    selectAll();
    reloadLogIn();
}


function sidemenuOn() {
    document.querySelector("div.side-menu").classList.remove("hidden");
    activeUsers();
}
function sidemenuOff() {
    document.querySelector("div.side-menu").classList.add("hidden");
}
function activeUsers() {
    console.log("activeUsers");
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(renderUsers);
}
function renderUsers(get) {
    const userlist = get.data;
    document.querySelector(".userlist").innerHTML = '';

    //User "Todos"
    if (msgType === "message")
        document.querySelector(".userlist").innerHTML += '<li onclick="selectAll()" class="all selected"><ion-icon name="people"></ion-icon>Todos<ion-icon name="checkmark-sharp"></ion-icon> </li>';
    else if (msgType === "private_message")
        document.querySelector(".userlist").innerHTML += '<li onclick="selectAll()" class="all"><ion-icon name="people"></ion-icon>Todos<ion-icon name="checkmark-sharp"></ion-icon> </li>';

    //Users Ativos
    for (let i=0 ; i<userlist.length ; i++) {
        if (userlist[i].name === username)
            document.querySelector(".userlist").innerHTML += `<li class="user" data-identifier="participant"><ion-icon name="person-circle"></ion-icon><span>(Eu) ${userlist[i].name}</span><ion-icon name="checkmark-sharp"></ion-icon></li>`;
        else if (userlist[i].name === target)
            document.querySelector(".userlist").innerHTML += `<li class="selected" onclick="selectTarget(this)" data-identifier="participant"><ion-icon name="person-circle"></ion-icon><span>${userlist[i].name}</span><ion-icon name="checkmark-sharp"></ion-icon></li>`;
        else
            document.querySelector(".userlist").innerHTML += `<li onclick="selectTarget(this)" data-identifier="participant"><ion-icon name="person-circle"></ion-icon><span>${userlist[i].name}</span><ion-icon name="checkmark-sharp"></ion-icon></li>`;
    }
}

function selectAll() {
    target = "Todos";
    msgType = "message";

    console.log(`${msgType} Target: ${target}`);

    document.querySelector("li.all").classList.add("selected");
    document.querySelector("li.message").classList.add("selected");
    document.querySelector("li.pvt-message").classList.remove("selected");
    const participants = document.querySelectorAll(".side-menu > div:nth-of-type(2) ul:nth-of-type(1) li");
    for(let i=0 ; i<participants.length ; i++)
        uncheck(participants[i]);

    document.querySelector("div.msg-box p").classList.add("hidden");
}
function selectTarget(element) {
    const li = element;
    li.classList.add("selected");
    
    target = `${li.querySelector("span").innerHTML}`;
    msgType = "private_message";
    
    console.log(`${msgType} Target: ${target}`);

    document.querySelector("div.msg-box p").innerHTML = `Enviando para ${target} (Reservadamente)`;
    document.querySelector("div.msg-box p").classList.remove("hidden");

    document.querySelector("li.pvt-message").classList.add("selected");
    document.querySelector("li.all").classList.remove("selected");
    document.querySelector("li.message").classList.remove("selected");
    const participants = document.querySelectorAll(".side-menu > div:nth-of-type(2) ul:nth-of-type(1) li");
    for(let i=0 ; i<participants.length ; i++)
        uncheck(participants[i]);
}
function uncheck(element) {
    element.classList.remove("selected");
}


function initInput() {
    const msgInput = document.querySelector("div.msg-box form");
    msgInput.addEventListener('submit', inputEvent);
}
function inputEvent(event) {
    event.preventDefault();
}

function logInScreen() {
    const name = document.querySelector("div.login input").value;
    logIn(name);

    document.querySelector("div.login div.loading").classList.remove("hidden");
}
function reloadLogIn() {
    window.location.reload();
}

function gmtConvert(time) { 
    let hour = time[0];
    hour += time[1];
    hour = Number(hour) - 3;
    hour = String(hour);

    let newtime = '';
    if (hour.length < 2)
        newtime += '0';
    newtime += hour;
    for (let i=2 ; i<time.length ; i++)
        newtime += (time[i]);

    return newtime;
}



refreshChat();
initInput();
setInterval(refreshChat, 3000); //Especificação 3000ms
setInterval(activeUsers, 3000); //Especificação 10000ms, alterado pela fluidez da aplicação