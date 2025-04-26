// userSchema.js (models/userSchema.js)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_no: { type: Number, required: true, unique: true },
    profile_picture: { type: String,default: "/uploads/default-profile.png" }, // Store filename
    bio: { type: String, default: "" },
    role: {
        type: String,
        enum: ["Admin", "Moderator", "Member", "Guest"],
        default: "Member",
    },
    github_link: { type: String },
    linkedin_link: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friend_requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    collaborations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    bookmarked_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    status: { type: String, enum: ["Online", "Offline"], default: "Online" },
    social_profiles: [{ type: String }],
    notifications: [
        {
            message: String,
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    last_seen: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    account_status: {
        type: String,
        enum: ["Active", "Suspended", "Deactivated"],
        default: "Active",
    },
    two_factor_auth: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
});

module.exports = mongoose.model("User", userSchema);