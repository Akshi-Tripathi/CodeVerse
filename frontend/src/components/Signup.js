import React, { useState } from "react";
import {
    FaEnvelope,
    FaEye,
    FaEyeSlash,
    FaGithub,
    FaImage,
    FaLinkedin,
    FaLock,
    FaPhone,
    FaSpinner,
    FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../api';
import "../styles/Form.css";

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        phone_no: "",
        profile_picture: null, // Store the file object
        bio: "",
        github_link: "",
        linkedin_link: "",
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        if (e.target.name === "profile_picture") {
            setFormData({ ...formData, profile_picture: e.target.files[0] }); // Get the file object
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await registerUser(formData); // Call the API function
            setLoading(false);

            if (response.success) {
                setMessage("Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
            } else {
                setError(response.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            setError("An error occurred during registration. Please try again.");
            setLoading(false);
        }
    };
    return (
        <div className="signup-body">
            <div className="form-container signup-container">
                <h2>Create an Account</h2>
                <p className="form-subtitle">Join our community of developers</p>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-section">
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onMouseEnter={() => setShowPassword(true)}
                                onMouseLeave={() => setShowPassword(false)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        <div className="input-group">
                            <FaPhone className="input-icon" />
                            <input
                                type="text"
                                name="phone_no"
                                placeholder="Phone Number"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            {/* <FaImage className="input-icon" /> */}
                            <input
                                type="file" // Change to file input
                                name="profile_picture"
                                accept="image/*" // Accept only image files
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-section">
                        <div className="input-group textarea-group">
                            <textarea
                                name="bio"
                                placeholder="Tell us about yourself"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <FaGithub className="input-icon" />
                            <input
                                type="text"
                                name="github_link"
                                placeholder="GitHub Profile Link"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <FaLinkedin className="input-icon" />
                            <input
                                type="text"
                                name="linkedin_link"
                                placeholder="LinkedIn Profile Link"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`submit-button ${loading ? "loading" : ""}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <p className="redirect-link">
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;