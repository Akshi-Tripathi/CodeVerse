const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    languages_used: [String],
    visibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
    tags: [String],
    files: [{
        filename: { type: String, required: true },
        filepath: { type: String, required: true }
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
