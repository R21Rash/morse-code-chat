const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST"],
  },
});

// WebSocket for Morse Signal Communication
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("sendMorse", (data) => {
    const decodedMessage = decodeMorse(data);
    io.emit("receiveMessage", decodedMessage);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Helper to decode Morse (backend-side processing)
function decodeMorse(morse) {
  const morseCodeMap = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
  };

  return morse
    .split(" ")
    .map((code) => morseCodeMap[code] || "")
    .join("");
}
socket.on("sendMorse", (data) => {
  const decodedText = decodeMorse(data.morse); // Decode Morse
  io.emit("receiveMessage", { morse: data.morse, text: decodedText });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
