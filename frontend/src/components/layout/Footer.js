import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img
                src="https://png.pngtree.com/png-vector/20250123/ourmid/pngtree-gold-om-symbol-with-golden-decoration-png-image_15312501.png"
                alt="Om Symbol"
                className="footer-logo-icon"
              />
              <span className="footer-logo-text">Sankalpam</span>
            </div>
            <p className="footer-tagline">
              Your trusted partner in pujas, astrology, and spiritual journeys.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="tel:123456789" target="_self" aria-label="Call us" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#000", textDecoration: "none", }} >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" >
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.59a1 1 0 01-.25 1.01l-2.2 2.19z"/>
                </svg>
              </a>

              <a href="mailto:contact@sankalpam.com" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/pujas" onClick={() => window.scrollTo(0, 0)}>Pujas</Link></li>
              <li><Link to="/astrology" onClick={() => window.scrollTo(0, 0)}>Astrology</Link></li>
              <li><Link to="/ecommerce" onClick={() => window.scrollTo(0, 0)}>Ecommerce</Link></li>
              <li><Link to="/tourism" onClick={() => window.scrollTo(0, 0)}>Tourism</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-info">
              <li>123 Divine Path, Varanasi, India</li>
              <li>Email: contact@sankalpam.com</li>
              <li>Phone: +91 123 456 7890</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 Sankalpam. All Rights Reserved
            {' | '}
            <a href="/privacy-policy">Privacy Policy</a>
            {' | '}
            <a href="/terms-of-service">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
