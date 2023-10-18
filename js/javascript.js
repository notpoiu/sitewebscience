/*
template for chat
<div class="chat-wrapper" id="AI">
    <div class="pfp-chat">
        <img src="assets/robot.svg" alt="robot pfp" style="width: 35px;height: 35px;"></img>
    </div>
    <p style="display: inline-block;padding-top: 0;">Salut! Je suis l'IA de ce site. Comment puis-je vous aider?</p>
</div>


<div class="chat-wrapper" id="USER">
    <div class="pfp-chat">
        <img src="assets/user.svg" alt="user pfp" style="width: 35px;height: 35px;"></img>
    </div>
    <p style="display: inline-block;padding-top: 0;">pluh</p>
</div>
*/

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

    let p = document.createElement("p");
    p.style.display = "inline-block";
    p.style.paddingTop = "0";
    p.innerHTML = message;

    pfpChat.appendChild(img);
    chatWrapper.appendChild(pfpChat);
    chatWrapper.appendChild(p);

    return chatWrapper;
}

document.addEventListener("DOMContentLoaded", function() {
    let textbox = document.querySelector("#textboxAI");
    let button = document.querySelector("#sendAI");
    let sendAIImg = document.querySelector("#sendAIImg");
    let chat = document.querySelector("#chatcontainer");
    let isLoadingResponse = false;

    button.onclick = function() {
        if (isLoadingResponse) {
            alert("Svp attendez que l'IA réponde avant d'envoyer un autre message.");
            return;
        }
        let userPrompt = textbox.value;
        textbox.value = "";

        let chatWrapper = createChatDiv(userPrompt, "USER");
        chat.appendChild(chatWrapper);
        

        isLoadingResponse = true;
        sendAIImg.src = "assets/loading.svg";
        
        response = fetch("https://api.upio.dev/v1/openai/chatbot", {
            method: "POST",
            body: JSON.stringify({
                prompt: userPrompt
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer upio-7cIzgWvo9V-OydbP1YBGP"
            }
        }).then(response => response.json()).then(response => {
            let chatWrapper = createChatDiv(response["message"], "AI");
            chat.appendChild(chatWrapper);
            isLoadingResponse = false;
            sendAIImg.src = "assets/send.svg";
        }).catch(error => {
            console.log(error);
            let chatWrapper = createChatDiv("Une erreur s'est produite. Veuillez réessayer.", "AI");
            chat.appendChild(chatWrapper);
            isLoadingResponse = false;
            sendAIImg.src = "assets/send.svg";
        });
    }
});