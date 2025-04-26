import React, { useState } from "react";
import { FaEnvelope, FaGithub, FaImage, FaLinkedin, FaPhone, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../api";
import "../styles/EditProfile.css";

const EditProfile = ({ onProfileUpdated = () => {} }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_no: "",
        bio: "",
        github_link: "",
        linkedin_link: "",
        profile_picture: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, profile_picture: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            Object.keys(formData).forEach((key) => {
                if (formData[key]) form.append(key, formData[key]); // Ensure profile_picture is included
            });

            const userId = localStorage.getItem("userId");
            if (!userId) {
                throw new Error("User ID is missing. Please log in again.");
            }

            const response = await updateProfile(userId, form);
            if (response.success) {
                setSuccessMessage("Profile updated successfully!");
                onProfileUpdated(response.user);
                setTimeout(() => navigate("/profile"), 2000);
            }
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="edit-profile-container">
                <h2>Edit Profile</h2>
                {successMessage && <p className="success">{successMessage}</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="input-group">
                        <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Name "
                                value={formData.name}
                                onChange={handleChange} // Add a placeholder to indicate it's optional
                            />
                        </div>

                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <FaPhone className="input-icon" />
                            <input
                                type="tel"
                                name="phone_no"
                                placeholder="Phone Number"
                                value={formData.phone_no}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <FaGithub className="input-icon" />
                            <input
                                type="url"
                                name="github_link"
                                placeholder="GitHub Profile URL"
                                value={formData.github_link}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <FaLinkedin className="input-icon" />
                            <input
                                type="url"
                                name="linkedin_link"
                                placeholder="LinkedIn Profile URL"
                                value={formData.linkedin_link}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group ">
                            <FaImage className="input-icon" />
                            <input
                                type="file"
                                name="profile_picture"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <textarea
                            name="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`submit-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default EditProfile;