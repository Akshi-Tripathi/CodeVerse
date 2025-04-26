import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import '../styles/Chat.css';

const socket = io("http://localhost:5000"); // Connect to the backend

const Chat = ({ projectId, username }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (isChatOpen) {
            socket.emit("joinRoom", projectId);

            socket.on("message", (msg) => {
                console.log("New message received:", msg);
                setMessages((prevMessages) => [...prevMessages, msg]);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [projectId, isChatOpen]);

    const toggleChatWindow = () => {
        setIsChatOpen(!isChatOpen);
    };

    const sendMessage = () => {
        if (message.trim()) {
            const msg = { projectId, username, text: message };
            socket.emit("message", msg); 
            setMessages((prevMessages) => [...prevMessages, msg]); 
            setMessage(""); // Clear the input field
        }
    };

    return (
        <div>
            <div className="chat-icon" onClick={toggleChatWindow}>
                💬
            </div>
            {isChatOpen && (
                <div className="chat-container">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <strong>{msg.username}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default Chat;