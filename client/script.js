import { io } from "https://cdn.skypack.dev/socket.io-client";
let joinBtn = document.getElementById("join");
let pregamediv = document.getElementById("pregame");
let gamediv = document.getElementById("gameArea");
let cardsdiv = document.getElementById("cardsdiv");
let gameState = {};
var socket = null;

joinBtn.addEventListener("click", () => {
    if (document.getElementById("nameInput").value === "") return;

    socket = io("ws://localhost:3000");

    socket.emit("join", {
        username: document.getElementById("nameInput").value,
    });
    document.getElementById("usernameInputDiv").style.display = "none";

    updateGameState(socket);
});

function updateGameState(socket) {
    socket.on("gameStarted", () => {
        startGame();
    });

    socket.on("gameStateUpdate", (data) => {
        gameState = data;
        if (!data.started) {
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
        } else {
            for (let i = 0; i < gameState.users.length; i++) {
                const user = gameState.users[i];
                if (user.id == gameState.currentPlayer.id) {
                    document.getElementById("player" + parseInt(i + 1)).style.backgroundColor =
                        "green";
                    user.cards.forEach((card) => {
                        console.log(card);
                        let cardDiv = document.getElementById(card.id);
                        if (cardDiv) {
                            cardDiv.style.opacity = "1";
                        }
                    });
                } else {
                    document.getElementById("player" + parseInt(i + 1)).style.backgroundColor =
                        "transparent";
                        user.cards.forEach((card) => {
                            let cardDiv = document.getElementById(card.id);
                            if (cardDiv) {
                                cardDiv.style.opacity = "0.5";
                            }
                        });
                }
            }

            let round =
                gameState.matches[gameState.matches.length - 1].rounds[
                    gameState.matches[gameState.matches.length - 1].rounds.length - 1
                ];
            let turn = round.turns[round.turns.length - 1];
            if (!turn) return;
            let playerIndex = gameState.users.findIndex((user) => user.id === turn.player.id);
            console.log(playerIndex);
            document.getElementById(
                "player" + parseInt(playerIndex + 1)
            ).innerHTML = `<img src="./cards/${turn.card.id}.svg">`;
        }
    });

    socket.on("playCard", (data) => {});
}

function startGame() {
    pregamediv.style.display = "none";
    gamediv.style.display = "flex";
    for (let i = 0; i < gameState.users.length; i++) {
        const user = gameState.users[i];
        //document.getElementById("player" + parseInt(i + 1)).innerHTML = user.username;
        if (user.id === socket.id) {
            user.cards.forEach((card) => {
                let cardDiv = document.createElement("div");
                let cardImg = document.createElement("img");
                cardImg.src = `./cards/${card.id}.svg`;
                cardImg.id = card.id;
                cardDiv.classList.add("card-div");
                cardImg.classList.add("card-img");
                if (user.id !== gameState.currentPlayer.id) {
                    cardImg.style.opacity = "0.5";
                } else {
                    cardImg.style.opacity = "1";
                }
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
