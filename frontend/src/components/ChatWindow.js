import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getChats } from '../api'; 
import '../styles/ChatWindow.css';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
});

const ChatWindow = ({ projectId, username, onClose }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        socket.emit('joinRoom', projectId);

        const fetchChats = async () => {
            try {
                const response = await getChats(projectId);
                setMessages(Array.isArray(response) ? response : []); // Ensure messages is always an array
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError(err.message || 'Failed to fetch chats.');
                setMessages([]); 
            }
        };

        fetchChats();

        const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => {
                if (!prevMessages.some((msg) => msg._id === data._id)) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [projectId]);

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        const newMessage = {
            _id: Date.now(), 
            projectId,
            username,
            message,
            timestamp: new Date(),
        };

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages) => [...prevMessages, newMessage]);

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