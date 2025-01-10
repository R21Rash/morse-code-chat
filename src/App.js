import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import CryptoJS from "crypto-js"; // Import crypto library

const socket = io("http://localhost:4000"); // Connect to backend

// Morse code dictionary for conversion
const morseCodeMap = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  0: "-----",
  " ": "/",
};

// Encryption/Decryption key (must match on backend)
const SECRET_KEY = "supersecretkey123"; // Replace with a more secure key

// Function to convert English to Morse code
const convertToMorse = (text) => {
  return text
    .toUpperCase()
    .split("")
    .map((char) => morseCodeMap[char] || "")
    .join(" ");
};

// Function to encrypt messages
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

// Function to decrypt messages
const decryptMessage = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const App = () => {
  const [input, setInput] = useState(""); // Input field (text)
  const [morse, setMorse] = useState(""); // Real-time Morse code
  const [messages, setMessages] = useState([]); // Chat messages

  // Listen for encrypted messages from the server
  useEffect(() => {
    socket.on("receiveMessage", (encryptedMessage) => {
      const decryptedMessage = decryptMessage(encryptedMessage); // Decrypt the incoming message
      const [morseCode, plainText] = decryptedMessage.split("|"); // Split Morse and plain text

      setMessages((prev) => [
        ...prev,
        { type: "incoming", content: morseCode, text: plainText },
      ]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // Update Morse code in real-time as user types
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);
    setMorse(convertToMorse(text)); // Convert to Morse in real-time
  };

  // Send an encrypted message to the backend
  const handleSend = () => {
    if (input.trim()) {
      const plainText = input;
      const morseCode = morse;
      const combinedMessage = `${morseCode}|${plainText}`; // Combine Morse and plain text

      const encryptedMessage = encryptMessage(combinedMessage); // Encrypt the combined message
      socket.emit("sendMorse", encryptedMessage); // Send encrypted message

      // Add message to chat
      setMessages((prev) => [
        ...prev,
        { type: "outgoing", content: morseCode, text: plainText },
      ]);

      setInput(""); // Clear input field
      setMorse(""); // Clear real-time Morse
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-center py-4 text-xl font-bold">
        Morse Code Chat (Encrypted)
      </header>

      {/* Chat Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "outgoing" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.type === "outgoing"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white"
              }`}
              style={{
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <p className="font-mono text-sm">{msg.content}</p>
              {msg.text && <p className="text-xs mt-1">({msg.text})</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center p-4 bg-gray-800 space-x-2">
        <input
          className="flex-1 p-2 bg-gray-700 rounded-lg text-white focus:outline-none"
          placeholder="Type Text..."
          value={input}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>

      {/* Real-Time Morse Code */}
      {morse && (
        <div className="p-4 text-center bg-gray-800 text-green-400">
          Real-Time Morse: <span className="font-mono">{morse}</span>
        </div>
      )}
    </div>
  );
};

export default App;
