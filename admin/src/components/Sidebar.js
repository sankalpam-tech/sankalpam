import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const Sidebar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="admin-sidebar" style={{ display: 'flex' }}>
            <div className="sidebar-content">
                <div className="brand-section">
                    <div className="brand-icon">🕉️</div>
                    <div>
                        <h1 className="brand-title">Sankalpam</h1>
                        <p className="brand-subtitle">Admin Portal</p>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🛍️</span>
                        Products
                    </NavLink>
                    <NavLink to="/pujas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🙏</span>
                        Pujas
                    </NavLink>
                    <NavLink to="/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📅</span>
                        Bookings
                    </NavLink>
                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="user-section">
                    <div className="user-avatar">
                        {user?.name ? user.name[0].toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user?.name || 'Admin User'}</p>
                        <p className="user-role">{user?.role || 'Administrator'}</p>
                    </div>
                    <button onClick={logout} className="logout-btn" title="Logout">
                        ↪️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
