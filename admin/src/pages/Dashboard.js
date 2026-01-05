import React from 'react';
import Header from '../components/Header';
import '../styles/Admin.css';

const Dashboard = () => {
    return (
        <>
            <Header
                title="Dashboard"
                subtitle="Overview of your store performance"
            />
            <div className="content-area">
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                    <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#9c7349', fontSize: '14px' }}>Total Sales</h3>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹ 1,24,000</p>
                    </div>
                    <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#9c7349', fontSize: '14px' }}>Active Pujas</h3>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>12</p>
                    </div>
                    <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#9c7349', fontSize: '14px' }}>Pending Bookings</h3>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>5</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
