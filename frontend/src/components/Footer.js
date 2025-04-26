import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="footer-container">
        
        <div className="footer-section about">
          <h3>CodeVerse</h3>
          <p>Empowering developers with real-world projects and collaborations. Build, deploy, and connect with like-minded coders.</p>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/friends">Friends</Link></li>
            <li><Link to="/deploy">Deploy</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </div>

        <div className="footer-section social">
            <h4>Connect with Us</h4>
            <div className="social-icons">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
            </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CodeVerse | Designed for Developers</p>
      </div>
    </footer>
  );
}
