import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile, fetchProfile } from "../api"; // Add deleteProfile to the import
import "../styles/Profile.css";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetchProfile();
                if (response.success) {
                    setUser(response.user);
                    console.log(response.user);
                } else {
                    setError("Failed to load profile");
                    navigate("/login");
                }
            } catch (err) {
                setError("Failed to fetch profile. Please try again.");
                navigate("/login");
            }
            finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);
    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="error">{error}</p>;
    const handleProfileUpdated = (updatedUser) => {
        setUser(updatedUser); // Update the user state with the new data
    };

    const handleDeleteProfile = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            const response = await deleteProfile(user._id);
            if (response.success) {
                alert("Profile deleted successfully!");
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                navigate("/signup")
            } else {
                alert(response.message || "Failed to delete profile.");
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("An error occurred while deleting the profile. Please try again.");
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="error">{error}</p>;

    const profilePicUrl = user?.profile_picture?.startsWith('/uploads')
        ? `http://localhost:5000${user.profile_picture}`
        : user?.profile_picture || "/default-profile.png";

    console.log("Profile Picture URL:", profilePicUrl);

    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-left">
                    <div className="profile-picture-container">
                        <img src={profilePicUrl} alt="Profile" className="profile-pic" />
                        <div className="profile-status" title={user.status}></div>
                    </div>
                    <h2>{user.username}</h2>
                    <p className="user-role">{user.role}</p>
                    
                    <div className="stats-grid">
                        
                        <div className="stat-item">
                            <div className="stat-value">{user.projects?.length || 0}</div>
                            <div className="stat-label">Projects</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{user.collaborations?.length || 0}</div>
                            <div className="stat-label">Collabs</div>
                        </div>
                    </div>

                    <div className="social-links">
                        {user.github_link && (
                            <a href={user.github_link} target="_blank" rel="noopener noreferrer" className="social-link">
                                GitHub
                            </a>
                        )}
                        {user.linkedin_link && (
                            <a href={user.linkedin_link} target="_blank" rel="noopener noreferrer" className="social-link">
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>

                <div className="profile-right">
                    <div className="profile-header">
                        <h2>Personal Information</h2>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Status:</strong> {user.status}</p>
                    </div>

                    <div className="profile-bio info-card">
                        <h3>About Me</h3>
                        <p>{user.bio || "No bio available yet."}</p>
                    </div>

                    <div className="profile-grid">
                        {user.notifications && user.notifications.length > 0 && (
                            <div className="info-card">
                                <h3>Recent Activities</h3>
                                <div className="activity-list">
                                    {user.notifications.map((notification, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-icon">
                                                {/* Icon would go here */}
                                            </div>
                                            <div>
                                                <p>{notification.message}</p>
                                                <small>{new Date(notification.createdAt).toLocaleString()}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {user.social_profiles?.length > 0 && (
                            <div className="info-card">
                                <h3>Connected Accounts</h3>
                                <div className="social-links">
                                    {user.social_profiles.map((link, index) => (
                                        <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="social-link">
                                            Profile {index + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-actions">
                        <button onClick={() => navigate("/edit-profile")} className="btn btn-primary">
                            Edit Profile
                        </button>
                        <button onClick={handleDeleteProfile} className="btn btn-danger">
                            Delete Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
