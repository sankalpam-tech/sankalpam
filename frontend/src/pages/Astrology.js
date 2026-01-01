import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BookingPage from "./Bookingpage";
import astrologyBg from "../images/astrology.jpg";
import "../styles/Astrology.css";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200",
  "https://images.unsplash.com/photo-1532798442725-41036acc7489?w=1200",
  "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200",
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200",
];

const Astrology = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = astrologyBg;
  }, []);

  // Track viewport size for responsive behaviors
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((idx) => (idx + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Prevent body scroll when booking modal is open
  useEffect(() => {
    if (currentPage === "booking" && selectedService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [currentPage, selectedService]);

  const handleBookConsultation = (service) => {
    setSelectedService(service);
    setCurrentPage("booking");
  };

  const handleCloseModal = () => {
    setCurrentPage("home");
    setSelectedService(null);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${astrologyBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      willChange: 'background-image'
    }}>
      <Navbar activePage="astrology" />

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO SECTION */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '260px',
        }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            height: isMobile ? '220px' : '320px',
          }}>
            <div style={{
              display: 'flex',
              height: '100%',
              width: `${HERO_IMAGES.length * 100}%`,
              transform: `translateX(-${(100 / HERO_IMAGES.length) * slideIndex}%)`,
              transition: 'transform 0.6s ease',
            }}>
              {HERO_IMAGES.map((src, idx) => (
                <div
                  key={src}
                  style={{
                    flex: `0 0 ${100 / HERO_IMAGES.length}%`,
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                  aria-hidden={slideIndex !== idx}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}></div>
                </div>
              ))}
            </div>
            
            {/* Content Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              textAlign: 'center',
              padding: '0 20px'
            }}>
              <h1 className="astrology-hero-title" style={{
                color: '#fff',
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '16px',
                maxWidth: '800px',
                lineHeight: '1.2'
              }}>
                Unlock Your Destiny: Divine Guidance Through Vedic Astrology
              </h1>
              <p className="astrology-hero-description" style={{
                color: '#fff',
                fontSize: '16px',
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px'
              }}>
                Navigate life's journey with clarity and confidence. Our expert astrologers are here to illuminate your path.
              </p>
              <button className="astrology-hero-button" onClick={() => handleBookConsultation()} style={{
                padding: '14px 32px',
                backgroundColor: '#c41e3a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.2s ease',
                boxShadow: '0 10px 22px rgba(220, 38, 38, 0.35)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#b91c1c';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 14px 30px rgba(220, 38, 38, 0.45)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#c41e3a';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 22px rgba(220, 38, 38, 0.35)';
              }}
              >Book a Consultation</button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setSlideIndex((idx) => (idx - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
              aria-label="Previous slide"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
              style={{
                position: 'absolute',
                top: '50%',
                left: '-16px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 2,
                fontSize: '18px',
                paddingLeft: '8px',
                transition: 'background 0.3s',
              }}
            >
              {"<"}
            </button>
            <button
              onClick={() => setSlideIndex((idx) => (idx + 1) % HERO_IMAGES.length)}
              aria-label="Next slide"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
              style={{
                position: 'absolute',
                top: '50%',
                right: '-16px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 2,
                fontSize: '18px',
                paddingRight: '8px',
                transition: 'background 0.3s',
              }}
            >
              {">"}
            </button>
          </div>
        </div>

        {/* SERVICES SECTION */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '48px',
            color: '#000'
          }}>Explore Our Astrology Services</h2>

          <div className="astrology-services-grid">
            {[
              {
                title: "Personal Horoscope",
                desc: "Deep insights into your life's path based on your birth chart (Jaathakam).",
                img: "https://images.unsplash.com/photo-1532798442725-41036acc7489?w=400&h=400&fit=crop",
                price: "₹999"
              },
              {
                title: "Career & Finance",
                desc: "Guidance on professional growth and financial stability.",
                img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop",
                price: "₹1,499"
              },
              {
                title: "Marriage Matching",
                desc: "Assess compatibility and ensure a harmonious marital journey.",
                img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
                price: "₹1,999"
              },
              {
                title: "Vastu Shastra",
                desc: "Align your living space with cosmic energies for peace.",
                img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
                price: "₹2,499"
              }
            ].map((service, i) => (
              <div key={i} className="astrology-service-card">
                <div 
                  className="astrology-service-image"
                  style={{ backgroundImage: `url(${service.img})` }}
                ></div>
                <div className="astrology-service-content">
                  <h3 className="astrology-service-title">{service.title}</h3>
                  <p className="astrology-service-desc">{service.desc}</p>
                  <div className="astrology-service-footer">
                    <span className="astrology-service-price">{service.price}</span>
                    <button 
                      onClick={() => handleBookConsultation(service)} 
                      className="astrology-book-btn"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS SECTION */}
        <section className="astrology-steps-section">
          <h2 className="astrology-steps-title">Your Path to Clarity in 3 Simple Steps</h2>

          <div className="astrology-steps-grid">
            {[
              {
                icon: "👆",
                title: "1. Choose Your Service",
                desc: "Select the astrology service that resonates with your needs from our curated list."
              },
              {
                icon: "📅",
                title: "2. Provide Your Details",
                desc: "Fill in your birth details accurately to help our astrologers create your personalized reading."
              },
              {
                icon: "✉️",
                title: "3. Receive Your Report",
                desc: "Get your comprehensive report or schedule a consultation to receive divine guidance."
              }
            ].map((step, i) => (
              <div key={i} className="astrology-step-card">
                <div className="astrology-step-icon">{step.icon}</div>
                <h3 className="astrology-step-title">{step.title}</h3>
                <p className="astrology-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIAL SECTION */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '48px',
            color: '#000'
          }}>What Our Devotees Say</h2>

          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffe0e5',
            padding: '48px 60px',
            borderRadius: '12px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '30px',
              fontSize: '48px',
              color: '#c41e3a',
              opacity: 0.3,
              fontFamily: 'Georgia, serif'
            }}>"</div>
            <p style={{
              fontSize: '18px',
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '24px',
              color: '#333',
              lineHeight: '1.7'
            }}>
              "The guidance I received from Sankalpam was incredibly accurate and insightful. It helped me navigate a challenging period in my career with confidence. Truly a blessing!"
            </p>
            <p style={{
              textAlign: 'center',
              fontWeight: '600',
              color: '#c41e3a',
              fontSize: '16px'
            }}>- Ananya Sharma</p>
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '30px',
              fontSize: '48px',
              color: '#c41e3a',
              opacity: 0.3,
              fontFamily: 'Georgia, serif'
            }}>"</div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      {currentPage === "booking" && selectedService && (
        <div className="booking-modal-overlay" onClick={handleCloseModal}>
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="booking-modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <BookingPage 
              puja={{
                name: selectedService?.title || 'Astrology Consultation',
                price: selectedService?.price || '₹999',
                image: selectedService?.img
              }} 
              onBack={handleCloseModal}
              type="astrology"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Astrology;