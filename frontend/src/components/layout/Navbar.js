import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = ({ activePage = 'home' }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when a link is clicked (better UX on mobile)
  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <header
      className={`header ${isMenuOpen ? 'mobile-open' : ''}`}
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="header-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Logo section */}
        <div
          className="logo-section"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src="https://png.pngtree.com/png-vector/20250123/ourmid/pngtree-gold-om-symbol-with-golden-decoration-png-image_15312501.png"
            alt="Om Symbol"
            className="logo-icon"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
          <Link to="/" onClick={handleLinkClick} style={{ textDecoration: 'none' }}>
            <span
              className="logo-text"
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#c41e3a',
              }}
            >
              Sankalpam
            </span>
          </Link>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          type="button"
          className={`hamburger ${isMenuOpen ? 'is-active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Nav links */}
        <nav
          className="nav-links"
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            style={{
              color: activePage === 'home' ? '#c41e3a' : '#333',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: activePage === 'home' ? '600' : '500',
              transition: 'color 0.3s ease',
              position: 'relative',
              paddingBottom: '4px',
              borderBottom:
                activePage === 'home'
                  ? '2px solid #c41e3a'
                  : '2px solid transparent',
            }}
          >
            Home
          </Link>
          <Link
            to="/pujas"
            onClick={handleLinkClick}
            className={`nav-link ${activePage === 'pujas' ? 'active' : ''}`}
            style={{
              color: activePage === 'pujas' ? '#c41e3a' : '#333',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: activePage === 'pujas' ? '600' : '500',
              transition: 'color 0.3s ease',
              position: 'relative',
              paddingBottom: '4px',
              borderBottom:
                activePage === 'pujas'
                  ? '2px solid #c41e3a'
                  : '2px solid transparent',
            }}
          >
            Pujas
          </Link>

          {/* <Link
            to="/astrology"
            onClick={handleLinkClick}
            className={`nav-link ${activePage === 'astrology' ? 'active' : ''}`}
            style={{
              color: activePage === 'astrology' ? '#c41e3a' : '#333',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: activePage === 'astrology' ? '600' : '500',
              transition: 'color 0.3s ease',
              position: 'relative',
              paddingBottom: '4px',
              borderBottom:
                activePage === 'astrology'
                  ? '2px solid #c41e3a'
                  : '2px solid transparent',
            }}
          >
            Astrology
          </Link> */}

          <Link
            to="/ecommerce"
            onClick={handleLinkClick}
            className={`nav-link ${activePage === 'ecommerce' ? 'active' : ''}`}
            style={{
              color: activePage === 'ecommerce' ? '#c41e3a' : '#333',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: activePage === 'ecommerce' ? '600' : '500',
              transition: 'color 0.3s ease',
              position: 'relative',
              paddingBottom: '4px',
              borderBottom:
                activePage === 'ecommerce'
                  ? '2px solid #c41e3a'
                  : '2px solid transparent',
            }}
          >
            Ecommerce
          </Link>
          <Link
            to="/tourism"
            onClick={handleLinkClick}
            className={`nav-link ${activePage === 'tourism' ? 'active' : ''}`}
            style={{
              color: activePage === 'tourism' ? '#c41e3a' : '#333',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: activePage === 'tourism' ? '600' : '500',
              transition: 'color 0.3s ease',
              position: 'relative',
              paddingBottom: '4px',
              borderBottom:
                activePage === 'tourism'
                  ? '2px solid #c41e3a'
                  : '2px solid transparent',
            }}
          >
            Tourism
          </Link>
        </nav>

        {/* Right side buttons */}
        <div
          className="header-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '200px',
            justifyContent: 'flex-end',
          }}
        >
          {loading ? (
            /* Show nothing or a placeholder while checking auth */
            <div style={{ width: '40px', height: '40px' }}></div>
          ) : isAuthenticated ? (
            /* Profile Icon - Show when user is logged in */
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`profile-icon-link ${activePage === 'profile' ? 'active' : ''}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: activePage === 'profile' ? '#c41e3a' : '#f5f5f5',
                color: activePage === 'profile' ? '#fff' : '#c41e3a',
                border: activePage === 'profile' ? 'none' : '2px solid #c41e3a',
                transition: 'all 0.3s ease',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
              title="My Profile"
            >
              👤
            </Link>
          ) : (
            /* Sign In / Sign Up buttons - Show when not logged in */
            <>
              <Link
                to="/signin"
                onClick={handleLinkClick}
                style={{
                  textDecoration: 'none',
                  position: 'relative',
                  paddingBottom: '4px',
                  borderBottom:
                    activePage === 'signin'
                      ? '2px solid #c41e3a'
                      : '2px solid transparent',
                }}
              >
                <button
                  className="btn-signin"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#c41e3a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Sign In
                </button>
              </Link>
              <Link
                to="/signup"
                onClick={handleLinkClick}
                style={{
                  textDecoration: 'none',
                  position: 'relative',
                  paddingBottom: '4px',
                  borderBottom:
                    activePage === 'signup'
                      ? '2px solid #c41e3a'
                      : '2px solid transparent',
                }}
              >
                <button
                  className="btn-signup"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#fff',
                    color: '#c41e3a',
                    border: '2px solid #c41e3a',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;