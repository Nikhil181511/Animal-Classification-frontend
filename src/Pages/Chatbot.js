import React, { useState } from "react";
import "./Chatbot.css";

const PopupChatbot = ({ prediction: animalName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const API_URL = process.env.REACT_APP_API_URL || "https://animal-classification-backend.onrender.com";

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          prediction: animalName || "animal",  // Default fallback
        }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: typeof data.response === "string" ? data.response : JSON.stringify(data.response),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="chat-button" onClick={toggleChatbot}>
        <div className="chat-icon">
          {isOpen ? "✕" : "💬"}
        </div>
      </div>

      {/* Chatbot Container */}
      <div className={`chatbot-container ${!isOpen ? 'hidden' : ''}`}>
        <div className="chatbot-header">
          Expert animal assistant AI🤖
        </div>

        <div className="chatbox">
          {messages.length === 0 && (
            <div className="welcome-message">
              👋 How can I help you today?
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default PopupChatbot;
