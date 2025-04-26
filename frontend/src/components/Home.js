import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Clock from "./Clock"; 
import "../styles/Home.css";

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Empower Collaboration, Accelerate Development</h1>
                        <p>A real-time collaborative coding platform for seamless teamwork, version control, and live coding.</p>
                        {!user ? (
                            <button onClick={() => navigate("/signup")}>Join Now</button>
                        ) : (
                            <button onClick={() => navigate("/project")}>Explore Projects</button>
                        )}
                    </div>
                    <div className="hero-clock">
                        <Clock />
                    </div>
                </div>
            </section>

            <section className="problem-statement">
                <h2>The Challenge</h2>
                <p>
                    Developers face fragmented communication, limited collaboration tools, and complex role management.
                    Traditional systems struggle to integrate real-time coding, version control, and efficient teamwork.
                </p>
                <div className="problem-cards">
                    <div className="problem-card">
                        <h3>❌ Lack of Live Collaboration</h3>
                        <p>Real-time coding without proper version control leads to inconsistencies.</p>
                    </div>
                    <div className="problem-card">
                        <h3>❌ Fragmented Communication</h3>
                        <p>Switching between emails, Slack, and video calls slows down development.</p>
                    </div>
                    <div className="problem-card">
                        <h3>❌ Role Management Issues</h3>
                        <p>Difficulty in assigning roles and managing team permissions.</p>
                    </div>
                </div>
            </section>

            <section className="features">
                <h2>Why Choose CodeVerse?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>🚀 Live Code Collaboration</h3>
                        <p>View and edit code in real-time with teammates, powered by WebSockets.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🔗 GitHub Integration</h3>
                        <p>Manage repositories, commit changes, and resolve conflicts seamlessly.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🛠️ Role-Based Access</h3>
                        <p>Admins can assign roles to developers, ensuring secure and efficient project handling.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🎥 Chat Integration</h3>
                        <p>Chat for smooth developer communication.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🔐 Secure Authentication</h3>
                        <p>OAuth & JWT-based authentication for data protection and secure access.</p>
                    </div>
                    <div className="feature-card">
                        <h3>📈 Scalable & Accessible</h3>
                        <p>Optimized for both small teams and large-scale projects across all devices.</p>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <h2>How CodeVerse Works?</h2>
                <div className="steps">
                    <div className="step">
                        <h3>1️⃣ Create Your Team</h3>
                        <p>Sign up, invite teammates, and set up roles.</p>
                    </div>
                    <div className="step">
                        <h3>2️⃣ Code Together</h3>
                        <p>Work on code in real-time with built-in version control.</p>
                    </div>
                    <div className="step">
                        <h3>3️⃣ Communicate & Deploy</h3>
                        <p>Use chat, video calls, and deploy projects instantly.</p>
                    </div>
                </div>
            </section>

            <section className="use-cases">
                <h2>Who is CodeVerse for?</h2>
                <div className="use-case-grid">
                    <div className="use-case-card">
                        <h3>👨‍💻 Freelancers</h3>
                        <p>Collaborate on projects with global teams in real-time.</p>
                    </div>
                    <div className="use-case-card">
                        <h3>🏢 Startups</h3>
                        <p>Speed up development with seamless team collaboration.</p>
                    </div>
                    <div className="use-case-card">
                        <h3>🏫 Students & Educators</h3>
                        <p>Learn, teach, and build projects with live coding & chat.</p>
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <h2>What Developers Say</h2>
                <div className="testimonial-card">
                    <p>"CodeVerse transformed the way I collaborate. The live coding feature is a game-changer!"</p>
                    <h4>- Alex Johnson, Software Engineer</h4>
                </div>
                <div className="testimonial-card">
                    <p>"Seamless Git integration and role-based access make teamwork effortless!"</p>
                    <h4>- Sarah Lee, Web Developer</h4>
                </div>
            </section>

            <section className="cta">
                <h2>Ready to Code Smarter?</h2>
                <p>Join thousands of developers using CodeVerse for seamless collaboration.</p>
                {!user ? (
                    <button onClick={() => navigate("/signup")}>Get Started Now</button>
                ) : (
                    <button onClick={() => navigate("/project")}>Go to Projects</button>
                )}
            </section>
        </div>
    );
};

export default Home;
