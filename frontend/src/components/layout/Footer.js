import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/sankalpam.official?igsh=bzRwYmVqdnNvZXY0',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@sankalpam_official?si=e-TM9BJhfBiCK11C',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: 'Call',
      href: 'tel:+919121718321',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.59a1 1 0 01-.25 1.01l-2.2 2.19z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      href: 'mailto:sankalpamofficial@gmail.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: 'Pujas', to: '/pujas' },
    { label: 'Astrology', to: '/astrology' },
    { label: 'Ecommerce', to: '/ecommerce' },
    { label: 'Tourism', to: '/tourism' },
    { label: 'About Us', to: '/about' },
  ];

  const services = [
    { label: 'Puja Booking', to: '/pujas' },
    { label: 'Astrology', to: '/astrology' },
    { label: 'Products', to: '/ecommerce' },
    { label: 'Tourism', to: '/tourism' },
    { label: 'Rituals', to: '/pujas' },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-circle">
              <img
                src="https://png.pngtree.com/png-vector/20250123/ourmid/pngtree-gold-om-symbol-with-golden-decoration-png-image_15312501.png"
                alt="Sankalpam logo"
              />
            </div>
            <h2 className="brand-title">Sankalpam</h2>
          </div>
          <p className="brand-tagline">Your trusted partner in spiritual journeys</p>
          <div className="social-row">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.label === 'Call' || item.label === 'Email' ? '_self' : '_blank'}
                rel="noreferrer"
                aria-label={item.label}
                className="social-button"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="links-grid">
          <div className="link-column">
            <h3 className="link-heading">Quick Links</h3>
            <ul className="link-list">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} onClick={() => window.scrollTo(0, 0)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="link-column">
            <h3 className="link-heading">Services</h3>
            <ul className="link-list">
              {services.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} onClick={() => window.scrollTo(0, 0)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="link-column contact-block">
            <h3 className="link-heading">Contact</h3>
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                </svg>
              </span>
              <p>Flat 501, Janani Paradise, Miyapur, Hyderabad - 500049</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <a href="mailto:sankalpamofficial@gmail.com">sankalpamofficial@gmail.com</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:+919121718321">+91 9121718321</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 Sankalpam. All Rights Reserved</span>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
          <span className="footer-link-separator">|</span>
          <Link to="/terms-of-service" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link>
          <span className="footer-link-separator">|</span>
          <Link to="/refund-policy" onClick={() => window.scrollTo(0, 0)}>Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
