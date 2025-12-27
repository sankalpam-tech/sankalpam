import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/AboutUs.css';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="about-us">
        <div className="about-us-container">
          <h1>Privacy Policy</h1>
          <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <p><strong>Last Updated: January 2025</strong></p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to Sankalpam. We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              and use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect includes:
            </p>
            <ul>
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Booking and service preferences</li>
              <li>Device information and usage data</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Process and manage your bookings and orders</li>
              <li>Communicate with you about your services</li>
              <li>Improve our website and services</li>
              <li>Send you promotional materials (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at sankalpamofficial@gmail.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;


