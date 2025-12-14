import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.email === 'admin@sankalpam.com';

  return (
    <div className="profile-page">
      <Navbar activePage="profile" />

      <main className="profile-main">
        <div className="profile-container">
          {/* Page Heading */}
          <div className="profile-heading">
            <div className="heading-content">
              <h1 className="heading-title">{isAdmin ? 'Admin Profile' : 'My Profile'}</h1>
              <p className="heading-subtitle">
                {isAdmin 
                  ? 'Manage the Sankalpam platform, bookings, and users.' 
                  : 'Manage your profile, bookings, and account settings.'}
              </p>
            </div>
            {isAdmin && (
              <div className="admin-badge">
                <span className="badge-icon">👑</span>
                <span className="badge-text">Super Admin</span>
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-info">
              <div 
                className="profile-avatar"
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
              <div className="profile-details">
                <p className="profile-name">{isAdmin ? 'Priya Sharma' : user.name}</p>
                <p className="profile-email">{user.email}</p>
                <p className="profile-phone">{user.phone}</p>
                {isAdmin && <p className="profile-role">Administrator</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <div className="actions-container">
              {isAdmin ? (
                <>
                  <button className="action-button admin-button" onClick={() => navigate('/admin')}>
                    <span>📊 Admin Dashboard</span>
                  </button>
                  <button className="action-button admin-button" onClick={() => navigate('/admin')}>
                    <span>👥 Manage Users</span>
                  </button>
                  <button className="action-button admin-button" onClick={() => navigate('/admin')}>
                    <span>📅 All Bookings</span>
                  </button>
                  <button className="action-button admin-button" onClick={() => navigate('/admin')}>
                    <span>📝 Content Management</span>
                  </button>
                  <button className="action-button admin-button" onClick={() => navigate('/admin')}>
                    <span>⚙️ System Settings</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="action-button" onClick={() => navigate('/pujas')}>
                    <span>Pujas Bookings</span>
                  </button>
                  <button className="action-button" onClick={() => navigate('/astrology')}>
                    <span>Astrology Bookings</span>
                  </button>
                  <button className="action-button" onClick={() => navigate('/ecommerce')}>
                    <span>Ecommerce Orders</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="profile-logout">
            <button className="logout-button" onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
