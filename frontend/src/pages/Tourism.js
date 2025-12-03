import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Tourism.css';

const Tourism = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 90,
    hours: 18,
    minutes: 45,
    seconds: 32
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Calculate countdown to a specific launch date (90 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);
    targetDate.setHours(18, 45, 32);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you! We'll notify you at ${email} when Sacred Journeys launches.`);
      setEmail('');
    }
  };

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', backgroundColor: '#f8f7f5', minHeight: '100vh' }}>
      <Navbar activePage="tourism" />
      
      {/* Hero Section with Countdown */}
      <main className="tourism-hero">
        <div className="tourism-hero-overlay">
          <div className="tourism-hero-content">
            <div className="tourism-hero-text">
              <h1 className="tourism-hero-title">Sacred Journeys</h1>
              <h2 className="tourism-hero-subtitle">
                Embark on a spiritual pilgrimage to the most sacred destinations. Discover our curated tours, coming soon.
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="tourism-countdown">
              <div className="tourism-countdown-item">
                <div className="tourism-countdown-box">
                  <p className="tourism-countdown-number">{timeLeft.days}</p>
                </div>
                <div className="tourism-countdown-label">
                  <p>Days</p>
                </div>
              </div>
              <div className="tourism-countdown-item">
                <div className="tourism-countdown-box">
                  <p className="tourism-countdown-number">{timeLeft.hours}</p>
                </div>
                <div className="tourism-countdown-label">
                  <p>Hours</p>
                </div>
              </div>
              <div className="tourism-countdown-item">
                <div className="tourism-countdown-box">
                  <p className="tourism-countdown-number">{timeLeft.minutes}</p>
                </div>
                <div className="tourism-countdown-label">
                  <p>Minutes</p>
                </div>
              </div>
              <div className="tourism-countdown-item">
                <div className="tourism-countdown-box">
                  <p className="tourism-countdown-number">{timeLeft.seconds}</p>
                </div>
                <div className="tourism-countdown-label">
                  <p>Seconds</p>
                </div>
              </div>
            </div>

            <p className="tourism-notify-text">Be the first to know.</p>

            {/* Email Notification Form */}
            <form onSubmit={handleNotifySubmit} className="tourism-notify-form">
              <div className="tourism-input-container">
                <div className="tourism-input-icon">
                  <span>📧</span>
                </div>
                <input
                  type="email"
                  className="tourism-email-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="tourism-input-button">
                  <button type="submit" className="tourism-notify-button">
                    Notify Me
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tourism;
