(function() {

    const app = document.querySelector(".app");
    const socket = io();
    const menuButton = document.getElementById("menu-btn");
    const menuContent = document.querySelector(".menu-content");

    let uname;

    app.querySelector(".join-screen #username").focus();
    app.querySelector(".chat-screen #message-input").focus();

    app.querySelector(".join-screen #username").addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            app.querySelector(".join-screen #join-user").click();
        }
    });

    app.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = app.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });


    app.querySelector(".chat-screen #message-input").addEventListener("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            app.querySelector(".chat-screen #send-message").click();
        }
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function() {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update) {
        renderMessage("update", update);
    });

    socket.on("chat", function(message) {
        renderMessage("other", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (type == "my") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div style="background: #a8c5d5;">
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div style="background: #a8afd5;">
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

    menuButton.addEventListener("click", () => {
        menuContent.classList.toggle("show");
    });
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!target.closest(".menu")) {
            menuContent.classList.remove("show");
        }
    });

    function renderUsers(users) {
        let usersContainer = app.querySelector(".chat-screen .users");
        usersContainer.innerHTML = "";
        for (let user of users) {
            let el = document.createElement("div");
            el.setAttribute("class", "user");
            el.textContent = user;
            usersContainer.appendChild(el);
        }
    }

    socket.on("users", function(users) {
        renderUsers(users);
    });

})();