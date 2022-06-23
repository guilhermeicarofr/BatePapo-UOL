let username = '';



function refreshChat() {
    console.log("refresh");
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(renderChat);
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
    console.log(name);
    username = name;
    console.log(`Login: ${username}`);
    
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",{name:username});

    promise.then(setInterval(userOnline,5000));
    promise.catch(invalidUser);
}
function userOnline() {
    console.log(`Online: ${username}`);
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status",{name:username});
}
function invalidUser(error) {
    console.log(error.response.status);
    logIn(prompt('Nome de usuário já em uso! Insira um novo nome:'));
}

// function sendMsg() {

// }

logIn(prompt('Insira nome de usuário:'));
refreshChat();
setInterval(refreshChat, 3000);