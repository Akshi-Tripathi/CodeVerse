const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

require('dotenv').config();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Generate unique filename
    },
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const register = async (req, res) => {
    try {
        const { name, username, email, password, phone_no, bio, github_link, linkedin_link } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded', success: false });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long', success: false });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Phone Number already in use', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            phone_no,
            profile_picture: req.file.filename, // Store filename
            bio,
            social_profiles: [github_link, linkedin_link],
            verificationToken,
        });

        await newUser.save();

        console.log(`Verification token: ${verificationToken}`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to CoderzHub',
            text: 'Hello,\n\nWelcome to CoderzHub! We\'re excited to have you on board. If you need any help, feel free to reach out.\n\nBest regards,\nThe CoderzHub Team',
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('Error sending verification email:', err);
            else console.log('Verification email sent:', info.response);
        });

        return res.status(201).json({ message: 'User registered successfully. Please verify your email.', success: true });
    } catch (error) {
        console.error("Registration error:", error); // Log the error on the server
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.status(200).json({ success: true, token, userId: user._id, message: "Login successful" }); // Include userId in response
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.profile_picture && !user.profile_picture.startsWith('/uploads')) {
            user.profile_picture = `/uploads/${user.profile_picture}`;
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token', success: false });
        }

        user.verificationToken = null;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        console.log(`Password reset token: ${resetToken}`);

        return res.status(200).json({ message: 'Password reset token generated', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token', success: false });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }

        const updates = req.body;

        // If a file is uploaded, add its path to the updates
        if (req.file) {
            updates.profile_picture = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete the user's profile picture file if it exists
        if (user.profile_picture && user.profile_picture.startsWith('/uploads')) {
            const filePath = path.join(__dirname, '..', user.profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: 'Profile deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

module.exports = { upload, register, login, getProfile, verifyEmail, requestPasswordReset, resetPassword, updateProfile, deleteProfile };