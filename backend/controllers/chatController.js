const Chat = require('../models/chat');

exports.getChats = async (req, res) => {
    try {
        const { projectId } = req.params;
        const chats = await Chat.find({ projectId });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chats', error });
    }
};

exports.addChat = async (req, res) => {
    try {
        const { projectId, username, message } = req.body;
        const newChat = new Chat({ projectId, username, message });
        const savedChat = await newChat.save();
        res.status(201).json({ chat: savedChat });
    } catch (error) {
        res.status(500).json({ message: 'Error adding chat', error });
    }
};

exports.getChatsByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const chats = await Chat.find({ projectId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, message: 'Error fetching chats' });
    }
};