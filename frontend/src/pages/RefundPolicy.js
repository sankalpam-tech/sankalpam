import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/AboutUs.css';

const RefundPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="about-us">
        <div className="about-us-container">
          <h1>Refund Policy</h1>
          <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <p><strong>Last Updated: January 2025</strong></p>
            
            <h2>1. Refund Eligibility</h2>
            <p>
              Refunds may be available for certain services and products under specific circumstances. 
              Eligibility for refunds depends on the type of service or product purchased.
            </p>

            <h2>2. Puja Bookings</h2>
            <p>
              Cancellations made at least 48 hours before the scheduled puja date may be eligible for a full refund. 
              Cancellations made within 48 hours may be subject to a cancellation fee.
            </p>

            <h2>3. Astrology Consultations</h2>
            <p>
              Refunds for astrology consultations are available if cancelled at least 24 hours before the scheduled 
              appointment time. No refunds will be provided for completed consultations.
            </p>

            <h2>4. E-commerce Products</h2>
            <p>
              Physical products may be returned within 7 days of delivery for a full refund, provided they are 
              in original condition and packaging. Digital products are generally non-refundable.
            </p>

            <h2>5. Tourism Packages</h2>
            <p>
              Refund policies for tourism packages vary based on the package type and cancellation timing. 
              Please refer to the specific package terms at the time of booking.
            </p>

            <h2>6. Processing Time</h2>
            <p>
              Approved refunds will be processed within 7-14 business days to the original payment method used 
              for the transaction.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              For refund requests or questions about this policy, please contact us at sankalpamofficial@gmail.com 
              or call +91 9121718321
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RefundPolicy;


