const cards = require("./cards.js");

let updateInfo = () => {};
let _users = [
];
let _matches = [];
let _currentPlayer = 0;

const gameState = {
    get users() {
        return _users;
    },
    set users(value) {
        _users = value;
        //console.log("Users were updated", _users);
        updateInfo();
    },
    get matches() {
        return _matches;
    },
    set matches(value) {
        _matches = value;
        //console.log("Matches were updated", _matches);
        updateInfo();
    },
    get currentPlayer() {
        return _currentPlayer;
    },
    set currentPlayer(value) {
        _currentPlayer = value;        
        updateInfo();
    },
};

function initializeGameSocket(io) {
    updateInfo = () => {
        io.emit("gameStateUpdate", gameState);
    };

    io.on("connection", (socket) => {
        //console.log("User connected: " + socket.id);

        socket.on("join", (data) => {
            //console.log("User joined: " + data.username);
            let users = gameState.users;
            users.push({ id: socket.id, username: data.username, cards: [] });
            gameState.users = users;
        });

        socket.on("disconnect", () => {
            //console.log("User disconnected: " + socket.id);
            gameState.users = gameState.users.filter((user) => user.id !== socket.id);
            //console.log("Current users: ", gameState.users);
        });

        socket.on("startGame", () => {
            let shuffledDeck = shuffle();
            giveCards(shuffledDeck);
            let matches = gameState.matches;
            matches.push({ matchNumber: matches.length + 1, rounds: [] });
            gameState.matches = matches;
            gameState.currentPlayer = gameState.users[0];
            io.emit("gameStarted");
        });

        socket.on("playCard", (data) => {`1 `
            let currentPlayer = gameState.currentPlayer;
            let currentPlayerIndex = gameState.users.indexOf(currentPlayer);
            let nextPlayerIndex = (currentPlayerIndex + 1) % 4;
            let nextPlayer = gameState.users[nextPlayerIndex];
            let playedCard = data.card;

            let currentMatch = gameState.matches[gameState.matches.length - 1];
            let currentRound = currentMatch.rounds[currentMatch.rounds.length - 1];
            console.log(currentMatch);
            console.log(currentRound);
            
            gameState.currentPlayer = nextPlayer;
        });
    });
}


function giveCards(deck) {
    let users = gameState.users;
    for (let i = 0; i < 4; i++) {
        let user = users[i];
        user.cards = deck.slice(i * 10, i * 10 + 10);
    }
    gameState.users = users;
}

function shuffle() {
    let currentIndex = cards.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
    }

    return cards;
}

module.exports = initializeGameSocket;
