import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Home = () => {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar activePage="home" />
      <div style={{ padding: '60px 20px', textAlign: 'center', flex: 1 }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', color: '#333' }}>Welcome to Sankalpam</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>Your spiritual journey begins here</p>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
