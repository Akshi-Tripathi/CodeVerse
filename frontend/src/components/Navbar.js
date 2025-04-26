import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaSun, FaMoon, FaPalette } from "react-icons/fa";
import { themes } from "../config/themes";
import "../styles/Navbar.css";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const applyTheme = (themeName) => {
        const theme = themes[themeName];
        const root = document.documentElement;
        
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        
        localStorage.setItem('theme', themeName);
        setCurrentTheme(themeName);
        setShowThemeMenu(false);
    };

    useEffect(() => {
        // Apply theme on component mount
        applyTheme(currentTheme);
    }, []);

    return (
        <nav>
            <h2><Link to="/">CoderzHub</Link></h2>
            <ul>
                {!user ? (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Signup</Link></li>
                        <li className="theme-switcher">
                            <button onClick={() => setShowThemeMenu(!showThemeMenu)}>
                                <FaPalette />
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/project">Projects</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/rough">Rough</Link></li>
                        <li className="theme-switcher">
                            <button onClick={() => setShowThemeMenu(!showThemeMenu)}>
                                <FaPalette />
                            </button>
                        </li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                )}
            </ul>
            
            {showThemeMenu && (
                <div className="theme-menu">
                    {Object.entries(themes).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => applyTheme(key)}
                            className="theme-option"
                        >
                            {key === 'light' ? <FaSun /> : <FaMoon />}
                            {theme.name}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
