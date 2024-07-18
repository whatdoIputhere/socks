const cards = require("./cards.js");

let updateInfo = () => {};
let _users = [];
let _matches = [];
let _currentPlayer = 0;
let _started = false;

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
        _matches = value
        updateInfo();
    },
    get currentPlayer() {
        return _currentPlayer;
    },
    set currentPlayer(value) {
        _currentPlayer = value;
        updateInfo();
    },
    get started() {
        return _started;
    },
    set started(value) {
        _started = value;
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
            matches.push({
                matchNumber: matches.length + 1,
                trunfo: gameState.users[3].cards[0],
                rounds: [{ roundNumber: 1, turns: [] }],
            });
            gameState.matches = matches;
            gameState.currentPlayer = gameState.users[0];            
            gameState.started = true;
            io.emit("gameStarted");
        });

        socket.on("playCard", (data) => {
            updateRounds(data);
        });
    });
}

function updateRounds(data) {
    let users = gameState.users;
    let currentPlayer = gameState.currentPlayer;
    let nextPlayer = users[(users.indexOf(currentPlayer) + 1) % 4];
    let playedCard = data.card;

    let matches = gameState.matches;
    let match = matches[matches.length - 1];
    let round = match.rounds[match.rounds.length - 1];
    round.turns.push({ player: currentPlayer, card: playedCard });

    gameState.matches = matches;
    gameState.currentPlayer = nextPlayer;
    // if (round.turns.length == 4) {
        

    //     let nextRound = { roundNumber: round.roundNumber + 1, turns: [] };
    //     match.rounds.push(nextRound);
    //     gameState.matches = matches;
    //     gameState.currentPlayer = winner.player;
    // }
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
