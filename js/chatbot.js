/* Functions */

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
    div.style.width = "80%";
    div.style.alignItems = "center";
    div.style.textAlign = "left";

    let p = document.createElement("p");
    p.style.display = "inline-block";
    p.style.textAlign = "left";
    p.style.paddingTop = "0";
    p.innerHTML = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

    chatWrapper.appendChild(pfpChat);
    chatWrapper.appendChild(div);
    pfpChat.appendChild(img);
    div.appendChild(p);

    return chatWrapper;
}

function getParagraphFromChatDiv(chatDiv) {
    let p = chatDiv.querySelector("p");
    return p;
}

/* Local history stuff */

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

/* Typing thing function */

let messageQueue = [];
let isProcessingQueue = false;

function processQueue(paragraph) {
    if (messageQueue.length > 0 && !isProcessingQueue) {
        isProcessingQueue = true;
        const message = messageQueue.shift();
        typeMessage(message, paragraph, () => {
            isProcessingQueue = false;
            processQueue(paragraph);
        });
    }
}

function typeMessage(message, element, callback) {
    let chat = document.querySelector("#chatcontainer");
    
    let index = 0;
    const intervalId = setInterval(() => {
        let msg = message.charAt(index);
        msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br>');

        element.innerHTML += msg;
        chat.scrollTop = chat.scrollHeight;

        index += 1;
        if (index === message.length) {
            clearInterval(intervalId);
            if (callback) callback();
        }
    }, 50);
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

    textbox.addEventListener("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            button.click();
        }
    });

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
        
        const chatWrapperAI = createChatDiv("", 'AI');
        chat.appendChild(chatWrapperAI);
        
        const paragraph = getParagraphFromChatDiv(chatWrapperAI);

        let aiResponseStr = "";
        async function fetchStream() {
            try {
                const response = await fetch('https://api.upio.dev/v1/openai/chatbot', {
                    method: 'POST',
                    body: JSON.stringify({ prompt: userPrompt }),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer "
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Network HTTP ${response.statusText}`);
                }

                const reader = response.body.getReader();
                let decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const message = decoder.decode(value);

                    if (message == "event: stream-ended"){
                        break;
                    }

                    chat.scrollTop = chat.scrollHeight;
                    if (message.includes("event: stream-ended")) {
                        aiResponseStr += message.replace("event: stream-ended", "");

                        messageQueue.push(message.replace("event: stream-ended", ""));
                        processQueue(paragraph);

                        chat.scrollTop = chat.scrollHeight;
                        break;

                    }else{
                        aiResponseStr += message;
                        
                        messageQueue.push(message);  
                        processQueue(paragraph);

                        chat.scrollTop = chat.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Fetch error:', error);
                paragraph.innerHTML = "Une erreur est survenue. Veuillez réessayer plus tard.";
                aiResponseStr = "Une erreur est survenue. Veuillez réessayer plus tard.";
            } finally {
                isLoadingResponse = false;
                sendAIImg.src = "assets/send.svg";
                chat.scrollTop = chat.scrollHeight;
                
                addToLocalStorageHistory(aiResponseStr, 'AI');
            }
        }
        
        fetchStream();
        
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