import React from 'react';
import './Rough.css';

const Rough = () => {
  return (
    <div className="eco-home">
      <header className="hero">
        <h1>Welcome to EcoLife</h1>
        <p>Making Earth a Better Place, One Step at a Time</p>
        <button className="cta-button">Join Our Mission</button>
      </header>

      <section className="features">
        <h2>Our Impact</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-tree"></i>
            <h3>Plant Trees</h3>
            <p>We've planted over 1M trees worldwide</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-recycle"></i>
            <h3>Reduce Waste</h3>
            <p>Promoting zero-waste lifestyle</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-solar-panel"></i>
            <h3>Clean Energy</h3>
            <p>Supporting renewable energy initiatives</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of eco-warriors in our mission to protect the planet.</p>
        <button className="cta-button">Get Started</button>
      </section>

      <footer>
        <p>© 2023 EcoLife. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Rough;
