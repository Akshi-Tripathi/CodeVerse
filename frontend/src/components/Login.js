import React, { useContext, useEffect, useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { AuthContext, useAuth } from "../context/AuthContext";
import "../styles/Form.css";

const Login = () => {
    const [formData, setFormData] = useState({ identifier: localStorage.getItem('identifier') || "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setError("");
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await loginUser(formData);
            if (response.success) {
                console.log("Login successful");
                login(response.token, response.userId); // Updated to include userId
                navigate("/profile");
            } else {
                setError(response.message || "Invalid credentials");
            }
        } catch (error) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth();
    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
    }, [user, navigate]);

    return (
        <div className="login-body">
            <div className="form-container login-container">
                <h2>Welcome Back!</h2>
                <p className="form-subtitle">Login to continue your journey</p>
                
                {error && (
                    <div className="error-message">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="text"
                            name="identifier"
                            placeholder="Email or Username"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon"  />
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
                            {showPassword ? <FaEye style={{ marginRight: "7rem" }} /> : <FaEyeSlash style={{ marginRight: "7rem" }} />}
                        </button>
                    </div>

                    <div className="form-footer">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot Password?
                        </a>
                    </div>

                    <button type="submit" className={`submit-button ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="redirect-link">
                    Don't have an account? <a href="/signup">Create Account</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
