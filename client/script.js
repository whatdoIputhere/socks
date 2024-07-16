import { io } from "https://cdn.skypack.dev/socket.io-client";
const socket = io("ws://10.123.152.11:3000");

socket.on("updateUserCount", (data) => {  
  document.getElementById("userCount").innerHTML = "Users connected: " + data.userCount;
});