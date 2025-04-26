import React, { useState } from 'react';
import './Chat.css';
import ChatWindow from './ChatWindow';

const Chat = ({ projectId, username }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChatWindow = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div>
            <div className="chat-icon" onClick={toggleChatWindow}>
                💬
            </div>
            {isChatOpen && <ChatWindow projectId={projectId} username={username} onClose={toggleChatWindow} />}
        </div>
    );
};

export default Chat;