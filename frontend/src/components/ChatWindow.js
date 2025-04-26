import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getChats } from '../api'; 
import '../styles/ChatWindow.css';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'], // Ensure compatibility with different transport methods
});

const ChatWindow = ({ projectId, username, onClose }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Join the project room
        socket.emit('joinRoom', projectId);

        // Fetch chat history
        const fetchChats = async () => {
            try {
                const response = await getChats(projectId);
                setMessages(Array.isArray(response) ? response : []); // Ensure messages is always an array
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError(err.message || 'Failed to fetch chats.');
                setMessages([]); // Reset messages to an empty array on error
            }
        };

        fetchChats();

        // Listen for new messages
        const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => {
                // Avoid adding duplicate messages
                if (!prevMessages.some((msg) => msg._id === data._id)) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
        };

        socket.on('receiveMessage', handleReceiveMessage);

        // Cleanup on component unmount
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [projectId]);

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        const newMessage = {
            _id: Date.now(), // Temporary ID for local state
            projectId,
            username,
            message,
            timestamp: new Date(),
        };

        // Emit the message to the server
        socket.emit('sendMessage', newMessage);

        // Add the message to the local state
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Clear the input field
        setMessage('');
    };

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>Project Chat</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat-message ${msg.username === username ? 'sent' : 'received'}`}
                    >
                        <strong>{msg.username}</strong>
                        {msg.message}
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;