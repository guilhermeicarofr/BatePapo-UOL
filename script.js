let username = '';
let target = "Todos";
let msgType = "message";


function refreshChat() {
    console.log("refreshChat");
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(renderChat);
}
function renderChat(get) { //Verificar quebra de linha em nomes grandes de usuários
    const chat = get.data;
    document.querySelector('.chat').innerHTML = '';
    for (let i=0 ; i<chat.length ; i++) {

        switch (chat[i].type) {
            case "message":
                document.querySelector('.chat').innerHTML += `
                    <div class="msg">
                        &nbsp;
                        <span class="time">(${chat[i].time})</span>
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
                        <span class="time">(${chat[i].time})</span>
                        &nbsp;
                        <span class="user">${chat[i].from}</span>
                        &nbsp;
                        <span class="text">${chat[i].text}</span>
                    </div>
                `;
                break;

            case "private-message":
                if (chat[i].to === username || chat[i].from === username)
                    document.querySelector('.chat').innerHTML += `
                        <div class="pvt-msg">
                            &nbsp;
                            <span class="time">(${chat[i].time})</span>
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
    promise.then(setInterval(userOnline,5000));
    promise.catch(invalidUser);
}
function userOnline() { //Verificar depois de algum tempo online a requisição começa a retornar BAD REQUEST
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status",{name:username});
    promise.then(console.log(`Online: ${username}`));
}
function invalidUser(error) {
    console.log(error.response.status);
    if (error.response.status === 400)
        logIn(prompt('Nome de usuário já em uso! Insira um novo nome:'));
}

function sendMsg() { //Investigar reload/crash da página quando uso o input com enter na textarea. não é problema na função nem erro de bad request. Algum problema no html mesmo
    const text = document.querySelector('.msg-box input').value;
    console.log(`${msgType} from ${username} to ${target}: ${text}`);
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",{
        from: username,
    	to: target,
	    text: text,
	    type: msgType
    });

    promise.then(refreshChat);
    promise.catch(failMsg);

    document.querySelector('.msg-box input').value = '';
    target = "Todos";
    msgType = "message";
}
function failMsg(error) {
    console.log(error.response.status);
    if (error.response.status === 400)
        console.log(error.response);
        window.location.reload();
}

function sidemenuOn() {
    document.querySelector("div.side-menu").classList.remove("hidden");
    activeUsers();
    setInterval(activeUsers, 10000);
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
    document.querySelector(".userlist").innerHTML = '<li><ion-icon name="people"></ion-icon>Todos<ion-icon name="checkmark-sharp"></ion-icon> </li>';
    
    for (let i=0 ; i<userlist.length ; i++) {
        document.querySelector(".userlist").innerHTML += `<li><ion-icon name="person-circle"></ion-icon>${userlist[i].name}<ion-icon name="checkmark-sharp"></ion-icon></li>`;
    }
}

refreshChat();
logIn(prompt('Insira nome de usuário:'));
setInterval(refreshChat, 3000); //Alterar para 3000ms cmo na especificação