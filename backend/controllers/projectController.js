const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

exports.createProject = async (req, res) => {
    try {
        const { name, description, admin, collaborators, files_folder, languages_used, visibility, tags } = req.body;

        console.log("Admin ID during project creation:", admin); // Debugging log

        const adminUser = await User.findById(admin);
        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const collaboratorIds = collaborators.map(collab => new mongoose.Types.ObjectId(collab));

        const project = new Project({
            name,
            description,
            admin: new mongoose.Types.ObjectId(admin), // Ensure admin is set correctly
            collaborators: collaboratorIds,  
            files_folder,
            languages_used,
            visibility,
            tags
        });

        await project.save();

        adminUser.projects.push(project._id);
        await adminUser.save();

        for (const collabId of collaboratorIds) {
            const collaborator = await User.findById(collabId);
            if (collaborator) {
                collaborator.collaborations.push(project._id);
                await collaborator.save();
            }
        }

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user._id; // Authenticated user's ID

        // Fetch projects with valid admin and collaborators
        const projects = await Project.find({
            $or: [
                { visibility: "Public" },
                { visibility: "Private", collaborators: userId },
                { visibility: "Private", admin: userId },
            ],
        })
            .populate("admin", "username email")
            .populate("collaborators", "username email");

        // Filter out projects with null admin or collaborators
        const validProjects = projects.filter(
            (project) => project.admin && project.collaborators
        );

        // Add a flag to indicate if the user is a collaborator
        const projectsWithAccessInfo = validProjects.map((project) => ({
            ...project.toObject(),
            isCollaborator: project.collaborators.some(
                (collab) => collab && collab._id.toString() === userId.toString()
            ) || project.admin._id.toString() === userId.toString(),
        }));

        res.status(200).json({ success: true, projects: projectsWithAccessInfo });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('admin', 'username email')
            .populate('collaborators', 'username email');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const project = await Project.findByIdAndUpdate(id, updatedData, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await User.findByIdAndUpdate(project.admin, { $pull: { projects: project._id } });

        await project.deleteOne();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
};

exports.addCollaborator = async (req, res) => {
    try {
        const { projectId, userId } = req.body;

        const project = await Project.findById(projectId);
        const user = await User.findById(userId);
        if (!project || !user) return res.status(404).json({ message: 'Project or User not found' });

        if (!project.collaborators.includes(userId)) {
            project.collaborators.push(userId);
            await project.save();

            user.collaborations.push(projectId);
            await user.save();
        }

        res.status(200).json({ message: 'Collaborator added successfully', project });
    } catch (error) {
        res.status(500).json({ message: 'Error adding collaborator', error: error.message });
    }
};

exports.removeCollaborator = async (req, res) => {
    try {
        const { projectId, userId } = req.body;

        const project = await Project.findById(projectId);
        const user = await User.findById(userId);
        if (!project || !user) return res.status(404).json({ message: 'Project or User not found' });

        project.collaborators = project.collaborators.filter(collab => collab.toString() !== userId);
        await project.save();

        user.collaborations = user.collaborations.filter(proj => proj.toString() !== projectId);
        await user.save();

        res.status(200).json({ message: 'Collaborator removed successfully', project });
    } catch (error) {
        res.status(500).json({ message: 'Error removing collaborator', error: error.message });
    }
};

exports.changeProjectStatus = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Authenticated User:", req.user);

        const { projectId, status } = req.body;

        // Validate the new status
        if (!['Active', 'Completed', 'Archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid project status' });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            console.warn(`Project not found: ${projectId}`);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the authenticated user is the admin of the project
        if (project.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can change the project status' });
        }

        // Update the project status
        project.status = status;
        await project.save();

        console.log("Project status updated:", project);

        res.status(200).json({ message: 'Project status updated successfully', project });
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ message: 'Error updating project status', error: error.message });
    }
};

exports.getProjectFiles = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        console.log("Project Files from Database:", project.files);

        const filesDir = path.join(__dirname, '..', 'projects', projectId);
        const files = project.files.map(file => {
            const filePath = path.join(filesDir, file.filename);
            const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
            return { ...file.toObject(), content };
        });

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching project files:', error);
        res.status(500).json({ message: 'Error fetching project files', error: error.message });
    }
};

exports.saveFileContent = async (req, res) => {
    try {
        const { projectId, filePath, content } = req.body;

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Construct the full path for the file
        const projectDir = path.join(__dirname, '..', 'projects', projectId);
        const fullPath = path.join(projectDir, filePath);

        // Ensure the project directory exists
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        // Write the file content
        fs.writeFileSync(fullPath, content);

        // Update the project files in the database
        const fileIndex = project.files.findIndex(file => file.filepath === filePath);
        if (fileIndex === -1) {
            project.files.push({
                filename: path.basename(filePath),
                filepath: filePath,
            });
        } else {
            project.files[fileIndex].filename = path.basename(filePath);
            project.files[fileIndex].filepath = filePath;
        }

        await project.save();

        res.status(200).json({ message: 'File saved successfully' });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ message: 'Error saving file', error: error.message });
    }
};

exports.getFileContent = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { filePath } = req.body;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Construct the full path based on the architecture
        const fullPath = path.join(
            __dirname,
            '..',
            'projects',
            projectId,
            'projects',
            projectId,
            filePath
        );

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        res.status(200).json({ content });
    } catch (error) {
        console.error('Error fetching file content:', error);
        res.status(500).json({ message: 'Error fetching file content', error: error.message });
    }
};

exports.getAllCollaborators = async (req, res) => {
    try {
        const projects = await Project.find().populate('collaborators', 'username email');

        const collaboratorsData = projects.map(project => ({
            projectName: project.name,
            collaborators: project.collaborators.map(collab => ({
                username: collab.username,
                email: collab.email
            }))
        }));

        res.json({ success: true, collaborators: collaboratorsData });
    } catch (error) {
        console.error("Error fetching collaborators:", error);
        res.status(500).json({ success: false, message: "Failed to fetch collaborators" });
    }
};

exports.getProjectsByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params; // Correctly destructure adminId
        console.log("Admin ID received:", adminId); // Debugging log

        // Fetch projects where the admin matches the provided adminId
        const projects = await Project.find({ admin: adminId })
            .populate('admin', 'username email') // Populate admin details
            .populate('collaborators', 'username email'); // Populate collaborators

        console.log("Projects fetched for admin:", projects); // Debugging log

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error("Error fetching projects by admin:", error);
        // Ensure the response is sent only once
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to fetch projects by admin" });
        }
    }
};

exports.getProjectsByCollaborator = async (req, res) => {
    try {
        const { userId } = req.params; // Correctly destructure userId
        console.log("Collaborator ID received:", userId); // Debugging log

        // Fetch projects where the user is a collaborator
        const projects = await Project.find({ collaborators: userId })
            .populate('admin', 'username email') // Populate admin details
            .populate('collaborators', 'username email'); // Populate collaborators

        console.log("Projects fetched for collaborator:", projects); // Debugging log

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error("Error fetching projects by collaborator:", error);
        // Ensure the response is sent only once
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to fetch projects by collaborator" });
        }
    }
};
