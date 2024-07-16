function initializeGameSocket(io) {
    let _userCount = 0;
    let _text = "";

    const gameState = {
        get userCount() {
            return _userCount;
        },
        set userCount(value) {
            _userCount = value;
            updateUserCount();
        },
        get text() {
            return _text;
        },
        set text(value) {
            _text = value;
            updateGameState();
        },
    };

    const updateGameState = () => {
        io.emit("gameStateUpdate", gameState);
    };

    const updateUserCount = () => {
        io.emit("updateUserCount", gameState);
        console.log("User count updated: " + gameState.userCount);
    };

    io.on("connection", (socket) => {
        gameState.userCount++;
        console.log("A user connected: " + socket.id);

        socket.on("message", (text) => {
            console.log("message received: ", text);
            gameState.text = text;
            io.emit("gameStateUpdate", text);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: " + socket.id);
            gameState.userCount--;
        });
    });
}

module.exports = initializeGameSocket;
