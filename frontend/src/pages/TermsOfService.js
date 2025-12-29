import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/AboutUs.css';

const TermsOfService = () => {
  return (
    <>
      <Navbar />
      <div className="about-us">
        <div className="about-us-container">
          <h1>Terms of Service</h1>
          <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <p><strong>Last Updated: January 2025</strong></p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Sankalpam's website and services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Services Description</h2>
            <p>
              Sankalpam provides spiritual services including puja bookings, astrology consultations, e-commerce products, 
              and tourism packages. We reserve the right to modify, suspend, or discontinue any service at any time.
            </p>

            <h2>3. User Responsibilities</h2>
            <p>
              Users are responsible for:
            </p>
            <ul>
              <li>Providing accurate and complete information</li>
              <li>Maintaining the confidentiality of account credentials</li>
              <li>Using services in compliance with applicable laws</li>
              <li>Respecting the rights of other users</li>
            </ul>

            <h2>4. Booking and Payment</h2>
            <p>
              All bookings are subject to availability. Payment must be made in full at the time of booking unless 
              otherwise specified. Refunds are subject to our Refund Policy.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              Sankalpam shall not be liable for any indirect, incidental, special, or consequential damages arising 
              from the use of our services.
            </p>

            <h2>6. Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at sankalpamofficial@gmail.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;



