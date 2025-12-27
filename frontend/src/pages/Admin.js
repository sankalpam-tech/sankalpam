import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pujas');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  React.useEffect(() => {
    if (!user || user.email !== 'admin123@gmail.com') {
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const bookingsData = [
    {
      id: '#PJ-2024-889',
      name: 'Ananya Singh',
      gotra: 'Kashyapa',
      avatar: 'AS',
      service: 'Ganapati Homa',
      location: 'Temple Premises',
      date: 'Oct 24, 2023',
      time: '09:00 AM',
      status: 'Pending',
      amount: '₹ 2,501',
      paymentStatus: 'Paid'
    },
    {
      id: '#PJ-2024-888',
      name: 'Rajesh Kumar',
      gotra: 'Bharadwaja',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Ac37SJXXqRSq3_hTE7zOfAATwVYK6x4PDBe0ihiOfKp2ubx3-fNEfC1pl8aQoTUkM1VR-db8leC73oySY1frLBduleXmjy2tDBcv4IR76E7MYugK4_NC9bCQYBNDIEf8515zfD7bRA95JqbSfCk9d5g5l57cDioGtZSF06J0qTsBKkO9Lr1M16VAtfLKcqQ1upnp_tCzg3cB5GPyr6tUVJJM6zSQIgg25Pn9zYtvH3PmPAZaIRrpvQAxBVnCQsIiayqw0AxYT-0',
      service: 'Rudra Abhishekam',
      location: 'Online (Zoom)',
      date: 'Oct 23, 2023',
      time: '06:30 AM',
      status: 'Confirmed',
      amount: '₹ 1,101',
      paymentStatus: 'Paid'
    },
    {
      id: '#PJ-2024-887',
      name: 'Vikram Lal',
      gotra: 'Vasistha',
      avatar: 'VL',
      service: 'Navagraha Shanti',
      location: 'Temple Premises',
      date: 'Oct 23, 2023',
      time: '11:00 AM',
      status: 'Cancelled',
      amount: '₹ 5,001',
      paymentStatus: 'Refunded'
    },
    {
      id: '#PJ-2024-886',
      name: 'Meera Iyer',
      gotra: 'Shandilya',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7BbtPycvIgIup0hAu0Mt9kdS1YL3I85fOjHpjg-6_Ey51G0VF1ZfVQINSBH5858K42MrIvEM-bYfCGPuRfDquXI9BiNw6xqKxiCuc2N7myS2Ly5danRE2W4pom1gAMBsLyFl75Xab39F9YTyTWyX39_C6isirMlvv8Qi7Ioj78R9_f-7AZDd7mjDZ5Wf0IJhjiVvvCH1n6Az8NWlJsTrLeG0RwfmkuAemxFoZpuNApumBOj2d4bz_y81VBtBT6UAB2ZMYIfwghXs',
      service: 'Saraswati Puja',
      location: 'Home Visit',
      date: 'Oct 22, 2023',
      time: '08:00 AM',
      status: 'Completed',
      amount: '₹ 3,001',
      paymentStatus: 'Paid'
    }
  ];

  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed'
    };
    return statusMap[status] || '';
  };

  return (
    <div className="admin-page-wrapper">
      <Navbar />
      
      <div className="admin-wrapper">
        {/* Sidebar */}
        <aside className="admin-sidebar">
        <div className="sidebar-content">
          {/* Brand */}
          <div className="brand-section">
            <div className="brand-icon">🕉</div>
            <div>
              <h1 className="brand-title">Sankalpam</h1>
              <p className="brand-subtitle">Admin Console</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-menu">
            <button className="nav-item" onClick={() => setActiveTab('dashboard')}>
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button className="nav-item active" onClick={() => setActiveTab('bookings')}>
              <span className="nav-icon">📅</span>
              <span>Bookings</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('users')}>
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('content')}>
              <span className="nav-icon">📝</span>
              <span>Content</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('products')}>
              <span className="nav-icon">🛍️</span>
              <span>Products</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setActiveTab('settings')}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <div className="user-section">
            <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="user-info">
              <p className="user-name">Priya Sharma</p>
              <p className="user-role">Super Admin</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header Image Banner */}
        <div className="admin-header">
          <div className="header-banner">
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <div>
                <h2 className="page-title">Booking Management</h2>
                <p className="page-subtitle">Oversee and manage all service requests in one place</p>
              </div>
              <div className="header-actions">
                <button className="btn-secondary">
                  <span>📥</span> Export Report
                </button>
                <button className="btn-primary">
                  <span>➕</span> New Booking
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="search-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by Order ID, Name, or Service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="status-indicators">
              <div className="status-indicator">
                <span className="status-dot green"></span>
                <span>System Operational</span>
              </div>
              <div className="divider"></div>
              <button className="notification-btn">
                🔔
                <span className="notification-badge"></span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-section">
            <button
              className={`tab ${activeTab === 'pujas' ? 'active' : ''}`}
              onClick={() => setActiveTab('pujas')}
            >
              <span>🙏</span>
              <span>Puja Bookings</span>
              <span className="badge">12</span>
            </button>
            <button
              className={`tab ${activeTab === 'astrology' ? 'active' : ''}`}
              onClick={() => setActiveTab('astrology')}
            >
              <span>✨</span>
              <span>Astrology</span>
            </button>
            <button
              className={`tab ${activeTab === 'ecommerce' ? 'active' : ''}`}
              onClick={() => setActiveTab('ecommerce')}
            >
              <span>🛒</span>
              <span>Ecommerce</span>
            </button>
            <button
              className={`tab ${activeTab === 'tourism' ? 'active' : ''}`}
              onClick={() => setActiveTab('tourism')}
            >
              <span>✈️</span>
              <span>Tourism</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* Filters */}
          <div className="filters-section">
            <button className="filter-chip">
              Status: All <span>▼</span>
            </button>
            <button className="filter-chip">
              Date: This Month <span>▼</span>
            </button>
            <button className="filter-chip">
              Priest: Any <span>▼</span>
            </button>
            <button className="clear-filters">Clear Filters</button>
          </div>

          {/* Data Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>ORDER ID</th>
                  <th>DEVOTEE NAME</th>
                  <th>SERVICE DETAILS</th>
                  <th>DATE & TIME</th>
                  <th>STATUS</th>
                  <th>AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {bookingsData.map((booking) => (
                  <tr key={booking.id}>
                    <td><input type="checkbox" /></td>
                    <td className="order-id">{booking.id}</td>
                    <td>
                      <div className="user-cell">
                        {booking.avatar.startsWith('http') ? (
                          <div
                            className="user-avatar-img"
                            style={{ backgroundImage: `url(${booking.avatar})` }}
                          ></div>
                        ) : (
                          <div className="user-avatar-text">{booking.avatar}</div>
                        )}
                        <div>
                          <p className="user-name">{booking.name}</p>
                          <p className="user-gotra">Gotra: {booking.gotra}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="service-name">{booking.service}</p>
                      <p className="service-location">{booking.location}</p>
                    </td>
                    <td>
                      <p className="booking-date">{booking.date}</p>
                      <p className="booking-time">{booking.time}</p>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <p className="amount">{booking.amount}</p>
                      <p className={`payment-status ${booking.paymentStatus === 'Paid' ? 'paid' : 'refunded'}`}>
                        {booking.paymentStatus}
                      </p>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn">👁️</button>
                        <button className="action-btn">⋮</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Showing <span>1</span> to <span>4</span> of <span>12</span> results
              </div>
              <div className="pagination-buttons">
                <button disabled>Previous</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>Next</button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="admin-footer">
            <p>© 2024 Sankalpam. All rights reserved.</p>
            <div className="footer-links">
              <button onClick={(e) => e.preventDefault()}>Privacy Policy</button>
              <button onClick={(e) => e.preventDefault()}>Terms of Service</button>
              <button onClick={(e) => e.preventDefault()}>Support</button>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <Footer />
  </div>
  );
};

export default Admin;
