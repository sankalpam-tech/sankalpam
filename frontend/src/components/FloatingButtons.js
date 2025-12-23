import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/FloatingButtons.css';

const FloatingButtons = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showTooltip, setShowTooltip] = useState({ whatsapp: false, call: false });

  // WhatsApp number and message
  const whatsappNumber = '+919121718321'; // Replace with actual number
  const whatsappMessage = encodeURIComponent('Hi, I would like to know more about Sankalpam services.');
  
  // Phone number for calling
  const phoneNumber = '+919121718321'; // Replace with actual number

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className={`floating-buttons-container ${!isHomePage ? 'other-page' : ''}`}>
      {/* WhatsApp Button */}
      <div 
        className="floating-button whatsapp-button"
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setShowTooltip({ ...showTooltip, whatsapp: true })}
        onMouseLeave={() => setShowTooltip({ ...showTooltip, whatsapp: false })}
        role="button"
        aria-label="Chat on WhatsApp"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleWhatsAppClick()}
      >
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 8.188-2.113c2.324 1.288 4.956 1.988 7.681 2.037h0.131c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.333c-2.547 0-5.043-0.7-7.217-2.024l-0.519-0.306-5.367 1.388 1.413-5.25-0.35-0.538c-1.449-2.263-2.213-4.875-2.213-7.603 0-7.721 6.279-14 14-14s14 6.279 14 14-6.279 14-14 14zM22.75 18.761c-0.413-0.206-2.444-1.206-2.819-1.344s-0.656-0.206-0.931 0.206c-0.275 0.413-1.069 1.344-1.313 1.619s-0.481 0.306-0.894 0.1c-0.413-0.206-1.744-0.644-3.319-2.050-1.225-1.094-2.056-2.444-2.3-2.856s-0.025-0.637 0.181-0.844c0.188-0.188 0.413-0.481 0.619-0.725s0.275-0.413 0.413-0.688c0.137-0.275 0.069-0.519-0.031-0.725s-0.931-2.244-1.275-3.075c-0.337-0.806-0.681-0.694-0.931-0.706-0.244-0.012-0.519-0.012-0.794-0.012s-0.725 0.1-1.1 0.519c-0.375 0.413-1.438 1.406-1.438 3.431s1.475 3.975 1.681 4.25c0.206 0.275 2.9 4.431 7.019 6.213 0.981 0.425 1.744 0.681 2.338 0.869 0.988 0.313 1.881 0.269 2.588 0.163 0.794-0.119 2.444-1 2.788-1.969s0.344-1.794 0.244-1.969c-0.1-0.175-0.375-0.275-0.788-0.481z" />
        </svg>
        {showTooltip.whatsapp && (
          <span className="floating-tooltip">Chat on WhatsApp</span>
        )}
      </div>

      {/* Call Button */}
      <div 
        className="floating-button call-button"
        onClick={handleCallClick}
        onMouseEnter={() => setShowTooltip({ ...showTooltip, call: true })}
        onMouseLeave={() => setShowTooltip({ ...showTooltip, call: false })}
        role="button"
        aria-label="Call Now"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleCallClick()}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="24"
          height="24"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        {showTooltip.call && (
          <span className="floating-tooltip">Call Now</span>
        )}
      </div>
    </div>
  );
};

export default FloatingButtons;
