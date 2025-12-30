import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from './layout/Footer';

const ComingSoon = ({ eventName, eventDate }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="coming-soon-page">
      {/* Back Button */}
      <div className="vm-back-button-container">
        <button 
          onClick={handleBack}
          className="vm-back-button"
          aria-label="Go back"
        >
          <FaArrowLeft className="vm-back-icon" />
          Back to Home
        </button>
      </div>

      <div className="coming-soon-content">
        <h1>{eventName}</h1>
        <p>Coming Soon</p>
        <div className="event-details">
          <p>Event Date: {eventDate}</p>
          <p>This page is under construction. Please check back later for updates.</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComingSoon;
