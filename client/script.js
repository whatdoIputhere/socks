import { io } from "https://cdn.skypack.dev/socket.io-client";
let joinBtn = document.getElementById("join");
let pregamediv = document.getElementById("pregame");
let gamediv = document.getElementById("gameArea");
let cardsdiv = document.getElementById("cardsdiv");
let gameState = {};
var socket = null;

joinBtn.addEventListener("click", () => {
    if (document.getElementById("nameInput").value === "") return;

    socket = io("ws://10.123.152.39:3000");

    socket.emit("join", {
        username: document.getElementById("nameInput").value,
    });
    document.getElementById("usernameInputDiv").style.display = "none";

    updateGameState(socket);
});

function startGame() {
    pregamediv.style.display = "none";
    gamediv.style.display = "flex";
    for (let i = 0; i < gameState.users.length; i++) {
        const user = gameState.users[i];
        document.getElementById("player" + parseInt(i + 1)).innerHTML = user.username;
        if (user.id === socket.id) {
            user.cards.forEach((card, index) => {
                let cardDiv = document.createElement("div");
                let cardImg = document.createElement("img");
                cardImg.src = `./cards/${card.id}.svg`;
                cardImg.id = card.id;
                cardDiv.classList.add("card-div");
                cardImg.classList.add("card-img");
                cardDiv.appendChild(cardImg);

                cardDiv.addEventListener("click", () => {
                    if (gameState.currentPlayer.id == socket.id) {
                        socket.emit("playCard", { player: user, card: card });
                        cardsdiv.removeChild(cardDiv);
                    }
                });

                cardsdiv.appendChild(cardDiv);
            });
        }
    }
}

function updateGameState(socket) {
    socket.on("gameStateUpdate", (data) => {
        gameState = data;
        let usersWaitingDiv = document.getElementById("usersWaiting");
        usersWaitingDiv.style.display = "block";
        let usersListDiv = document.getElementById("usersList");
        usersListDiv.innerHTML = "";
        gameState.users.forEach((user) => {
            let userDiv = document.createElement("div");
            let usernameSpan = document.createElement("span");
            usernameSpan.innerHTML = user.username;
            if (user.id === socket.id) {
                usernameSpan.style.fontWeight = "bold";
            }
            userDiv.appendChild(usernameSpan);
            usersListDiv.appendChild(userDiv);
        });

        if (gameState.users.length == 4) {
            let startBtn = document.createElement("button");
            startBtn.innerHTML = "Start Game";
            startBtn.addEventListener("click", () => {
                socket.emit("startGame");
            });
            usersListDiv.appendChild(startBtn);
        }

        for (let i = 0; i < gameState.users.length; i++) {
          const user = gameState.users[i];
          console.log(user);
          console.log(gameState.currentPlayer);
          if (user.id == gameState.currentPlayer.id) {
            document.getElementById("player" + parseInt(i + 1)).style.fontWeight = "bold";
          } else {
            document.getElementById("player" + parseInt(i + 1)).style.fontWeight = "normal";
          }    
        }
    });

    socket.on("gameStarted", () => {
        startGame();
    });
}
