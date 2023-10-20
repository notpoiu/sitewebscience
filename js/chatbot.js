function createChatDiv(message, id){
    let pfp = "";

    if (id == "AI") {
        pfp = "assets/robot.svg";
    } else {
        pfp = "assets/user.svg";
    }
    
    let chatWrapper = document.createElement("div");
    chatWrapper.classList.add("chat-wrapper");
    chatWrapper.id = id;

    let pfpChat = document.createElement("div");
    pfpChat.classList.add("pfp-chat");

    let img = document.createElement("img");
    img.src = pfp;
    img.alt = "pfp";
    img.style.width = "35px";
    img.style.height = "35px";

    let div = document.createElement("div");
    div.style.width = "90%";
    div.style.alignItems = "center";
    div.style.textAlign = "left";

    let p = document.createElement("p");
    p.style.display = "inline-block";
    p.style.paddingTop = "0";
    p.innerHTML = message;

    chatWrapper.appendChild(pfpChat);
    chatWrapper.appendChild(div);
    pfpChat.appendChild(img);
    div.appendChild(p);

    return chatWrapper;
}

function clearChat() {
    let chat = document.querySelector("#chatcontainer");
    chat.innerHTML = "";

    let history = localStorage.getItem("history");
    history = [];

    let chatWrapper = createChatDiv("Salut! Je suis l'IA de ce site. Comment puis-je vous aider?", "AI");
    chat.appendChild(chatWrapper);
    
    chat.scrollTop = chat.scrollHeight;
    localStorage.setItem("history", JSON.stringify(history));
}

function addToLocalStorageHistory(message,id) {
    let history = localStorage.getItem("history");

    if (history == null) {
        history = [];
    }
    else {
        history = JSON.parse(history);
    }

    history.push({
        "message": message,
        "id": id
    });

    localStorage.setItem("history", JSON.stringify(history));
    return true;
}


function setChatOpened(bool){
    localStorage.setItem("isChatOpen", bool);
}

function getChatOpened(){
    let isChatOpen = localStorage.getItem("isChatOpen");

    if (isChatOpen == null){
        isChatOpen = false;

        localStorage.setItem("isChatOpen",isChatOpen)
    }

    return isChatOpen;
}

function loadHistory() {
    let history = localStorage.getItem("history");

    if (history == null) {
        history = [];
    }
    else {
        history = JSON.parse(history);
    }

    let chat = document.querySelector("#chatcontainer");
    chat.innerHTML = "";

    let chatWrapper = createChatDiv("Salut! Je suis l'IA de ce site. Comment puis-je vous aider?", "AI");
    chat.appendChild(chatWrapper);

    for (let i = 0; i < history.length; i++) {
        let chatWrapper = createChatDiv(history[i]["message"], history[i]["id"]);
        chat.appendChild(chatWrapper);
    }

    return true;
}


document.addEventListener("DOMContentLoaded", function() {
    let textbox = document.querySelector("#textboxAI");
    let button = document.querySelector("#sendAI");
    let sendAIImg = document.querySelector("#sendAIImg");
    let chat = document.querySelector("#chatcontainer");
    let reloadChat = document.querySelector("#reloadChat");
    let chatbotMostlyMainDiv = document.querySelector("#chatbotMostlyMainDiv");
    let chatBtn = document.querySelector("#chatbtn");
    let isLoadingResponse = false;

    loadHistory();

    if (getChatOpened() == 'true'){
        chatbotMostlyMainDiv.style.display = "block";
        chat.scrollTop = chat.scrollHeight;
    }

    reloadChat.onclick = function() {
        clearChat();
    }	

    button.onclick = function() {
        if (isLoadingResponse) {
            alert("Svp attendez que l'IA réponde avant d'envoyer un autre message.");
            return;
        }
        let userPrompt = textbox.value;

        if (userPrompt.length > 75) {
            alert("Svp écrivez un message plus pettit.");
            return;
        }

        textbox.value = "";

        let chatWrapper = createChatDiv(userPrompt, "USER");
        chat.appendChild(chatWrapper);
        
        addToLocalStorageHistory(userPrompt, "USER");
        chat.scrollTop = chat.scrollHeight;

        isLoadingResponse = true;
        sendAIImg.src = "assets/loading.svg";
        
        response = fetch("https://api.upio.dev/v1/openai/chatbot", {
            method: "POST",
            body: JSON.stringify({
                prompt: userPrompt
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "
            }
        }).then(response => response.json()).then(response => {
            let chatWrapper = createChatDiv(response["message"], "AI");
            chat.appendChild(chatWrapper);
            isLoadingResponse = false;
            sendAIImg.src = "assets/send.svg";
            chat.scrollTop = chat.scrollHeight;
            addToLocalStorageHistory(response["message"], "AI");
        }).catch(error => {
            console.log(error);
            let chatWrapper = createChatDiv("Une erreur s'est produite. Veuillez réessayer.", "AI");
            chat.appendChild(chatWrapper);
            isLoadingResponse = false;
            sendAIImg.src = "assets/send.svg";
            chat.scrollTop = chat.scrollHeight;
            addToLocalStorageHistory("Une erreur s'est produite. Veuillez réessayer.", "AI");
        });
    }

    chatBtn.onclick = function() {
        if (chatbotMostlyMainDiv.style.display == "none") {
            setChatOpened(true);
            chatbotMostlyMainDiv.style.display = "block";
            chat.scrollTop = chat.scrollHeight;
        } else {
            setChatOpened(false);
            chatbotMostlyMainDiv.style.display = "none";
        }
    }
});