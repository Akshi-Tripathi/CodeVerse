const express = require('express');
const multer = require('multer');
const Project = require('../models/project');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const upload = multer({ dest: 'projects/' });

const projectController = require('../controllers/projectController');

// Apply authMiddleware to routes that require authentication
router.post('/create-project', authMiddleware, projectController.createProject);
router.get('/get-all-project', authMiddleware, projectController.getProjects);
router.get('/get-project/:id', authMiddleware, projectController.getProjectById);
router.put('/update-project/:id', authMiddleware, projectController.updateProject);
router.delete('/delete-project/:id', authMiddleware, projectController.deleteProject);
router.post('/add-collaborator-project', authMiddleware, projectController.addCollaborator);
router.post('/remove-collaborator-project', authMiddleware, projectController.removeCollaborator);

router.post('/change-status-project', authMiddleware, projectController.changeProjectStatus);
router.get('/get-project-files/:projectId', authMiddleware, projectController.getProjectFiles);
router.post('/:projectId/save-file', authMiddleware, projectController.saveFileContent);

router.get('/get-all-collaborators', authMiddleware, projectController.getAllCollaborators);
router.get('/get-projects-by-admin/:adminId', authMiddleware, projectController.getProjectsByAdmin);
router.get('/get-projects-by-collaborator/:userId', authMiddleware, projectController.getProjectsByCollaborator);

router.post('/:projectId/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).send('Project not found');
    }

    const fileReference = {
      filename: req.file.originalname,
      filepath: path.join('projects', req.file.filename)
    };

    project.files.push(fileReference);
    await project.save();

    res.send(fileReference);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:projectId/files', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).send('Project not found');
    }

    res.send({ files: project.files });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/:projectId/files/:filename', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).send('Project not found');
    }

    const fileIndex = project.files.findIndex(file => file.filename === req.params.filename);
    if (fileIndex === -1) {
      return res.status(404).send('File not found');
    }

    // Construct the file path based on the updated folder structure
    const filePath = path.join(
      __dirname,
      '..',
      'projects',
      req.params.projectId,
      project.files[fileIndex].filename
    );

    console.log("File Path to Delete:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist on disk: ${filePath}`);
      return res.status(404).send('File not found');
    }

    fs.unlinkSync(filePath);

    project.files.splice(fileIndex, 1);
    await project.save();

    res.send({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send(error.message);
  }
});

router.put('/:projectId/file/:filename', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      console.error(`Project not found: ${req.params.projectId}`);
      return res.status(404).send('Project not found');
    }

    const fileIndex = project.files.findIndex(file => file.filename === req.params.filename);
    if (fileIndex === -1) {
      console.error(`File not found in project database: ${req.params.filename}`);
      return res.status(404).send('File not found in database');
    }

    // Construct the old and new file paths based on the updated folder structure
    const oldFilePath = path.join(
      __dirname,
      '..',
      'projects',
      req.params.projectId,
      project.files[fileIndex].filename
    );
    const newFilePath = path.join(
      __dirname,
      '..',
      'projects',
      req.params.projectId,
      req.body.newFilename
    );

    console.log("Old File Path:", oldFilePath);
    console.log("New File Path:", newFilePath);

    // Check if the file exists on disk
    if (!fs.existsSync(oldFilePath)) {
      console.error(`File does not exist on disk: ${oldFilePath}`);
      return res.status(404).send('File not found on disk');
    }

    // Rename the file on disk
    fs.renameSync(oldFilePath, newFilePath);

    // Update the file details in the database
    project.files[fileIndex].filename = req.body.newFilename;
    project.files[fileIndex].filepath = req.body.newFilename;
    await project.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).send(error.message);
  }
});

router.post('/:projectId/files/content', authMiddleware, async (req, res) => {
  try {
    const { filePath } = req.body; // Extract filePath from the request body
    const projectDir = path.join(__dirname, '..', 'projects', req.params.projectId);
    const fullPath = path.join(projectDir, filePath); // Construct the full file path

    console.log("Fetching file content from path:", fullPath);

    if (!fs.existsSync(fullPath)) {
      console.error(`File does not exist: ${fullPath}`);
      return res.status(404).json({ message: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8'); // Read the file content
    res.status(200).json({ content });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ message: 'Error fetching file content', error: error.message });
  }
});

module.exports = router;
