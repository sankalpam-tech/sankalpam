import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();

  // 🔑 added loading
  const { user, isAuthenticated, logout, loading } = useAuth();

  // 🔑 wait until auth check finishes
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // 🔑 prevent early render / redirect
  if (loading) {
    return null; // or loader
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <Navbar activePage="profile" />

      <main className="profile-main">
        <div className="profile-container">
          {/* Page Heading */}
          <div className="profile-heading">
            <div className="heading-content">
              <h1 className="heading-title">
                My Profile
              </h1>
              <p className="heading-subtitle">
                Manage your profile, bookings, and account settings.
              </p>
            </div>
          </div>

          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-info">
              <div
                className="profile-avatar"
                style={{
                  backgroundImage: `url(${user.photo || '/default-avatar.png'})`,
                }}
              />
              <div className="profile-details">
                <p className="profile-name">
                  {user.name}
                </p>
                <p className="profile-email">{user.email}</p>
                <p className="profile-phone">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <div className="actions-container">
              <button
                className="action-button"
                onClick={() => navigate('/pujas')}
              >
                <span>Pujas Bookings</span>
              </button>
              <button
                className="action-button"
                onClick={() => navigate('/astrology')}
              >
                <span>Astrology Bookings</span>
              </button>
              <button
                className="action-button"
                onClick={() => navigate('/ecommerce')}
              >
                <span>Ecommerce Orders</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="profile-logout">
            <button
              className="logout-button"
              onClick={handleLogout}
            >
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
