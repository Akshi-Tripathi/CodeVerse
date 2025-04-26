const express = require('express');
const { register, login, getProfile, requestPasswordReset, resetPassword, updateProfile, upload, deleteProfile } = require('../controllers/authController'); // Import upload
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');
const router = express.Router();

// Registration route with multer for file upload
router.post('/register', upload.single('profile_picture'), register);

// Update profile route with multer for file upload
router.put('/updateprofile/:id', authMiddleware, upload.single('profile_picture'), updateProfile);

router.post('/login', login);
router.get('/getprofile', authMiddleware, getProfile);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.delete('/deleteprofile/:id', authMiddleware, deleteProfile);

router.get("/get-id", async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ userId: user._id });
});

module.exports = router;