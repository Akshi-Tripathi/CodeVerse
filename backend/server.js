const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectWithDb = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chatRoutes = require('./routes/chatRoutes');
const compileRoutes = require('./routes/compileRoutes');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(express.json());
app.use(cors({
    origin: 'https://your-frontend-url.onrender.com',
  }));
  
app.use(bodyParser.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, "uploads")));

connectWithDb();

app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/compile', compileRoutes); // Ensure this is correctly registered

const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir);
}

let projectFiles = {}; // Store file content for each project

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific project room
    socket.on('joinRoom', (projectId) => {
        socket.join(projectId);
        console.log(`User joined room: ${projectId}`);
        if (projectFiles[projectId]) {
            socket.emit('loadFiles', projectFiles[projectId]);
        } else {
            projectFiles[projectId] = {}; // Initialize project files if not present
        }
    });

    // Handle file changes
    socket.on('fileChange', ({ projectId, filePath, content }) => {
        if (!projectFiles[projectId]) projectFiles[projectId] = {};
        projectFiles[projectId][filePath] = content; // Update the file content
        socket.to(projectId).emit('fileUpdate', { filePath, content }); // Broadcast changes
    });

    // Handle chat messages
    socket.on("message", ({ projectId, username, text }) => {
        console.log(`Message received in project ${projectId}:`, { username, text });
        // Broadcast the message to all users in the same room
        socket.to(projectId).emit("message", { username, text });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});