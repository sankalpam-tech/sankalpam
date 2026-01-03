import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  FaArrowRight,
  FaPlay,
  FaPause,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "../styles/Home.css";
import promoImage from "../images/promo.jpg";

function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const pastEventsRef = useRef(null);
  const audioRef = useRef(null);
  const heroCarouselIntervalRef = useRef(null);

  const getEventLink = (event) => {
    const eventMap = {
      'maha shivaratri': '/mahashivarathri',
      'rudrabhishekam': '/rudrabhishekam',
      'makara sankranti homam': '/makara-sankranti',
      'vishwa shanti puja': '/vishwa-shanti-puja'
    };

    const lowerTitle = event.title.toLowerCase();
    const matchedEvent = Object.entries(eventMap).find(([key]) => lowerTitle.includes(key));

    return matchedEvent ? matchedEvent[1] : '/register';
  };

  // Show promo popup on initial load
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenPromoPopup');
    if (!hasSeenPopup) {
      setShowPromoPopup(true);
      sessionStorage.setItem('hasSeenPromoPopup', 'true');
    }
  }, []);

  const closePromoPopup = () => {
    setShowPromoPopup(false);
  };

  // Detect screen size for carousel
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    startHeroCarousel();

    return () => {
      if (heroCarouselIntervalRef.current) {
        clearInterval(heroCarouselIntervalRef.current);
      }
    };
  }, []);

  const startHeroCarousel = () => {
    if (heroCarouselIntervalRef.current) {
      clearInterval(heroCarouselIntervalRef.current);
    }

    heroCarouselIntervalRef.current = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Hero carousel navigation
  const nextHeroImage = () => {
    setCurrentHeroImageIndex((prevIndex) =>
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    );
    startHeroCarousel(); // Reset interval
  };

  const prevHeroImage = () => {
    setCurrentHeroImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
    startHeroCarousel(); // Reset interval
  };

  // Drag-to-scroll for Past Events (desktop/laptop)
  useEffect(() => {
    const container = pastEventsRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e) => {
      // Only enable drag on non-touch devices
      if ('ontouchstart' in window) return;
      isDown = true;
      container.classList.add('is-dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.classList.remove('is-dragging');
    };

    const handleMouseUp = () => {
      isDown = false;
      container.classList.remove('is-dragging');
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll speed factor
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Video carousel navigation functions
  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === videos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const goToVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  // Auto-rotate video carousel on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      nextVideo();
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, currentVideoIndex]);

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* ========================= PROMO POPUP ========================= */}
      {showPromoPopup && (
        <div className="promo-popup-overlay" onClick={closePromoPopup}>
          <div className="promo-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="promo-close-btn" onClick={closePromoPopup}>
              ✕
            </button>
            <img
              src={promoImage}
              alt="Sankalpam Promo"
              className="promo-image"
            />
          </div>
        </div>
      )}

      {/* ========================= SIMPLE MUSIC PLAYER ========================= */}
      <div className="music-player">
        <button className="music-toggle-btn" onClick={toggleMusic}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <audio
          ref={audioRef}
          loop
          src="/sankalpam2.mpeg"
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* ========================= REGISTRATION ANNOUNCEMENT BANNER ========================= */}
      <div className="registration-banner">
        <div className="registration-banner-content">
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
          <span className="banner-text">🎉 Registration Opening Soon - Stay Tuned! 🎉</span>
        </div>
      </div>

      {/* ========================= HERO WITH EVENTS SIDEBAR ========================= */}
      <div className="hero-events-container">
        {/* Hero Section with Carousel */}
        <section className="hero">
          <div className="hero-banner-wrapper">
            <div className="hero-banner-container">
              <div className="hero-carousel">
                <div
                  className="hero-carousel-track"
                  style={{
                    transform: `translateX(-${25 * currentHeroImageIndex}%)`,
                  }}
                >
                  {heroImages.map((src, idx) => (
                    <div
                      key={idx}
                      className="hero-carousel-slide"
                      style={{
                        backgroundImage: `url(${src})`,
                      }}
                      aria-hidden={currentHeroImageIndex !== idx}
                    >
                      <div className="hero-carousel-overlay"></div>
                    </div>
                  ))}
                </div>

                {/* Content Overlay */}
                <div className="hero-content">
                  <h1 className="hero-title">Connect with the Divine, Anywhere</h1>
                  <p className="hero-description">
                    Your spiritual journey begins with Sankalpam. Experience authentic rituals, expert guidance, and divine connections from the comfort of your home.
                  </p>
                  <button className="btn-explore" onClick={scrollToServices}>
                    Explore Our Services
                    <FaArrowRight style={{ marginLeft: '10px' }} />
                  </button>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevHeroImage}
                  aria-label="Previous slide"
                  className="hero-carousel-btn hero-carousel-btn-prev"
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
                >
                  {"<"}
                </button>
                <button
                  onClick={nextHeroImage}
                  aria-label="Next slide"
                  className="hero-carousel-btn hero-carousel-btn-next"
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>

          {/* Past Events Section */}
          <div className="past-events-wrapper">
            <h2 className="past-events-title">Past Events</h2>
            <div className="past-events-container">
              {/* Left Arrow for Scroll (Visual only for now or functional if implemented) */}
              {/* <button className="scroll-btn left"><FaChevronLeft /></button> */}

              <div className="past-events-list" ref={pastEventsRef}>
                {pastEvents.map((e, i) => (
                  <div className="past-event-card" key={i}>
                    <div className="past-event-date">
                      <span className="date">{e.date}</span>
                      <span className="month">{e.month}</span>
                    </div>
                    <div className="past-event-content">
                      <h3>{e.title}</h3>
                      <p>{e.desc}</p>
                      <Link to="/highlights" className="view-highlights-btn">
                        {e.cta} <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* <button className="scroll-btn right"><FaChevronRight /></button> */}
            </div>
          </div>
        </section>

        {/* Events Sidebar for Laptop & Large Screens */}
        <section className="events-sidebar">
          <h2 className="events-sidebar-title">Upcoming Events</h2>

          <div className="events-sidebar-list">
            {events.map((e, i) => (
              <Link to={getEventLink(e)} className="event-sidebar-card" key={i}>
                <div className="event-sidebar-date">
                  {e.date}
                  <small>{e.month}</small>
                </div>

                <div className="event-sidebar-content">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>

                <span className="btn-primary">
                  {e.cta}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ========================= SERVICES ========================= */}
      <section className="section" id="services-section">
        <h2 className="section-title">Our Divine Services</h2>

        <div className="service-grid">
          {serviceCards.map((s, i) => (
            <Link
              to={s.link}
              className="service-card"
              key={i}
              rel="noopener noreferrer"
            >
              <div
                className="service-image"
                style={{ backgroundImage: `url(${s.img})` }}
              />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================= VIDEOS ========================= */}
      <section className="section">
        <h2 className="section-title">Featured Videos</h2>

        {/* Tablet & Desktop: Infinite Scroll - SHOW 3 CARDS AT A TIME */}
        <div className="video-container no-scrollbar">
          <div className="video-row">
            {[...videos, ...videos].map((v, index) => (
              <a
                className="video-card"
                key={index}
                href={v.link}
                target="_blank"
                rel="noreferrer"
              >
                <div className="video-iframe-wrapper">
                  <iframe
                    className="video-iframe"
                    src={v.embedUrl}
                    title={`YouTube video ${index}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="video-caption">{v.caption}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Mobile: Carousel */}
        <div className="mobile-video-carousel">
          <div className="carousel-container">
            <button className="carousel-btn prev-btn" onClick={prevVideo}>
              <FaChevronLeft />
            </button>

            <div className="carousel-slide">
              {videos.map((v, index) => (
                <a
                  className={`video-card-carousel ${index === currentVideoIndex ? 'active' : ''}`}
                  key={index}
                  href={v.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    transform: `translateX(${(index - currentVideoIndex) * 100}%)`,
                    opacity: index === currentVideoIndex ? 1 : 0.7
                  }}
                >
                  <div className="video-iframe-wrapper">
                    <iframe
                      className="video-iframe"
                      src={v.embedUrl}
                      title={`YouTube video ${index}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="video-caption">{v.caption}</div>
                </a>
              ))}
            </div>

            <button className="carousel-btn next-btn" onClick={nextVideo}>
              <FaChevronRight />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {videos.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentVideoIndex ? 'active' : ''}`}
                onClick={() => goToVideo(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================= EVENTS (Mobile version - kept for mobile view) ========================= */}
      <section className="section mobile-events-section">
        <h2 className="section-title">Upcoming Events</h2>

        <div className="events-container">
          <div className="events-list">
            {events.map((e, i) => (
              <Link to={getEventLink(e)} className="event-card" key={i}>
                <div className="event-date">
                  {e.date}
                  <small>{e.month}</small>
                </div>

                <div className="event-content">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>

                <span className="btn-primary">
                  {e.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= PAST EVENTS (Mobile version) ========================= */}
      <section className="section mobile-events-section">
        <h2 className="section-title">Past Events</h2>

        <div className="events-container">
          <div className="events-list">
            {pastEvents.map((e, i) => (
              <Link to="/highlights" className="event-card" key={i}>
                <div className="event-date">
                  {e.date}
                  <small>{e.month}</small>
                </div>

                <div className="event-content">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>

                <span className="btn-primary" style={{ background: 'transparent', color: '#c41e3a', border: '1px solid #c41e3a', padding: '8px 16px' }}>
                  {e.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

export default Home;

// ===========================
// HERO IMAGES DATA
// ===========================
const heroImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjsL2OA0twT2tmNvxk_QYeJicbS5jkTLfB0OyVWqv21OBBXdUrI-EDL7xjEhLflMnPW1k3s9DneoTeMBzuzpY_C-wCHfd2YhpVcStM8q0cTHmswxwax1hIenWRPl5nWBpBsYpuwOv4egEsXpOUBQ1rc-M16vnwZV5PNCxBm8QzCAQ0DhsgsOPXoGkSswSs-NJonZQ4pJRd8zis8LSD-w5KfbppLoJhkRGLultiYYDw78yCIh4SFjwxkgM5y74j_hOO2y8Z0ApyUT8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpXX7EjaHEclR9khSbUlnV1ci2VcWxkwmNQxfqZyPm1WNA2q8vZe4nSoxugzDePSVzcncblP7xGEyZKRsEOgUXmLy0LrOzuB6dpwLa4eFReAi8aBvVPRblefhBN9YnJL184r9O5DiNPFOrkUvQBW8lAWGRCCYPSVh2-N7dzKnn-B4cgQa4tfu9hilgpTKf7eOGWoImNCxTf36kbc8T0JGYhtVsNo3FTzLZEV7bdW0EqwsQIFBolFbzXmtLfk2-hHhUr3e1OuXPo94",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLpEGJcbpu9LVHVw2qmEfC2dZ0iGTbCkefim5-5HTL603WFJ4VShvYuyLU4WRq2UKpw8gKOflwyO6hHtX90MwH2MOmfeuk0cxe2nxTSFVyt52BEFW4Te6k3iz6GWrRYeg5QiCS5BChpM1RHlvSe_jUQYTNOZhb6xbeQm8qQpMmR_p8-bMIQkQe1Q0NloB6LHKb5ns5sw0I9jr9U6mGT2MjE_Fy1c6TTuR85IkLUbN_znjIBhSBmBEUqyufwO9KtljkDsJ80Q7fAlw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCcZMqFCQLMD4MnVbMsDJoPk8S0sMI5qphA7mxdrOxg77ZeHpUrPreEPSirSRWKt01-69v41-LKHJFBd7NrTdTwX91NLRz8AmLIEtm7BQA6l9OEW40I8ejT3TUkgqQ5FRy6LyayqkeyTvw2kaIW2MVBIVAUHx2jl7tXsZzDbgNi0KFvPcAUciNmgaILnwY257WEEp1AIodU0pDkVINUZIHu84PeYFtqqpUHpI9qGKbddTfvA4edzfOhpPiyL5IMQcZvg3rUEHWDpq0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-i1K6KejjKCFT_Eu7GMB_rHO4kl69PzMrc41eCn3C1lyj1gzAX7gvVwbPuVFvgKaX_mwXFk27ExeIb_tOoiby7ADW7VzcETuve3y-YyOl2LJX7Q8D_BWzdXsErKbW1-wUa9fCZCy00KiVBRnA38Piy0RwjWf5OLD2G2Uq_f0f4Q008oPxH-LtIQBnkh-FH9S64zsDU0M13BJFuqKrYyk_Lhwn1rp1ZyrwC94nCuYvTFTEb7m7g4Oe92fyAmiFeKQw_7l8ccUIzo0"
];

// ===========================
// SERVICE DATA
// ===========================
const serviceCards = [
  {
    title: "Pujas",
    desc: "Participate in authentic pujas from home. Live streaming with experienced priests.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpXX7EjaHEclR9khSbUlnV1ci2VcWxkwmNQxfqZyPm1WNA2q8vZe4nSoxugzDePSVzcncblP7xGEyZKRsEOgUXmLy0LrOzuB6dpwLa4eFReAi8aBvVPRblefhBN9YnJL184r9O5DiNPFOrkUvQBW8lAWGRCCYPSVh2-N7dzKnn-B4cgQa4tfu9hilgpTKf7eOGWoImNCxTf36kbc8T0JGYhtVsNo3FTzLZEV7bdW0EqwsQIFBolFbzXmtLfk2-hHhUr3e1OuXPo94",
    link: "/pujas"
  },
  
  // {
  //   title: "Astrology",
  //   desc: "Insights from expert Vedic astrologers. Personalized guidance for life decisions.",
  //   img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLpEGJcbpu9LVHVw2qmEfC2dZ0iGTbCkefim5-5HTL603WFJ4VShvYuyLU4WRq2UKpw8gKOflwyO6hHtX90MwH2MOmfeuk0cxe2nxTSFVyt52BEFW4Te6k3iz6GWrRYeg5QiCS5BChpM1RHlvSe_jUQYTNOZhb6xbeQm8qQpMmR_p8-bMIQkQe1Q0NloB6LHKb5ns5sw0I9jr9U6mGT2MjE_Fy1c6TTuR85IkLUbN_znjIBhSBmBEUqyufwO9KtljkDsJ80Q7fAlw",
  //   link: "/astrology"
  // },

  {
    title: "Ecommerce",
    desc: "Guided spiritual tours to holy sites across India. Customized pilgrimage packages.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcZMqFCQLMD4MnVbMsDJoPk8S0sMI5qphA7mxdrOxg77ZeHpUrPreEPSirSRWKt01-69v41-LKHJFBd7NrTdTwX91NLRz8AmLIEtm7BQA6l9OEW40I8ejT3TUkgqQ5FRy6LyayqkeyTvw2kaIW2MVBIVAUHx2jl7tXsZzDbgNi0KFvPcAUciNmgaILnwY257WEEp1AIodU0pDkVINUZIHu84PeYFtqqpUHpI9qGKbddTfvA4edzfOhpPiyL5IMQcZvg3rUEHWDpq0",
    link: "/ecommerce"
  },
  {
    title: "Tourism",
    desc: "Authentic puja items, spiritual books, and divine artifacts. Quality guaranteed.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-i1K6KejjKCFT_Eu7GMB_rHO4kl69PzMrc41eCn3C1lyj1gzAX7gvVwbPuVFvgKaX_mwXFk27ExeIb_tOoiby7ADW7VzcETuve3y-YyOl2LJX7Q8D_BWzdXsErKbW1-wUa9fCZCy00KiVBRnA38Piy0RwjWf5OLD2G2Uq_f0f4Q008oPxH-LtIQBnkh-FH9S64zsDU0M13BJFuqKrYyk_Lhwn1rp1ZyrwC94nCuYvTFTEb7m7g4Oe92fyAmiFeKQw_7l8ccUIzo0",
    link: "/tourism"
  }
];

// ===========================
// EVENTS
// ===========================
const events = [
  {
    date: "15",
    month: "FEB",
    title: "Maha Shivaratri",
    desc: "Participate in a powerful devotional event with us in the khasi.",
    cta: "Register Now"
  },
  {
    date: "10",
    month: "DEC",
    title: "Rudrabhishekam",
    desc: `Holy ritual dedicated to Lord Shiva for peace, prosperity, and spiritual growth.`,
    cta: "Register Now"
  },
  {
    date: "14",
    month: "JAN",
    title: "Makara Sankranti Homam",
    desc: "Special homam to invoke blessings for new beginnings and prosperity.",
    cta: "Register Now"
  },
  {
    date: "26",
    month: "JAN",
    title: "Vishwa Shanti Puja",
    desc: "Group puja for peace, harmony, and universal well-being.",
    cta: "Register Now"
  }
];

const pastEvents = [
  {
    date: "15",
    month: "SEP",
    title: "Ganesh Chaturthi",
    desc: "Grand celebration of Ganesh Chaturthi with special pujas.",
    cta: "View Highlights"
  },
  {
    date: "22",
    month: "AUG",
    title: "Varalakshmi Vratam",
    desc: "Traditional Varalakshmi Vratam performed for prosperity.",
    cta: "View Highlights"
  },
  {
    date: "03",
    month: "JUL",
    title: "Guru Purnima Special",
    desc: "Special satsang and puja dedicated to spiritual gurus.",
    cta: "View Highlights"
  },
  {
    date: "21",
    month: "JUN",
    title: "International Yoga Day",
    desc: "Guided yoga and meditation session with Vedic chanting.",
    cta: "View Highlights"
  }
];

// ===========================
// VIDEOS WITH CAPTIONS
// ===========================
const videos = [
  {
    link: "https://youtu.be/mbcEIm6l5rw?si=7fh_f2HYcPdynZB3",
    embedUrl: "https://www.youtube.com/embed/mbcEIm6l5rw?si=7fh_f2HYcPdynZB3",
    caption: "video 1"
  },
  {
    link: "https://youtu.be/xpqwHcyy18g?si=MMEThkmG4iQtc70e",
    embedUrl: "https://www.youtube.com/embed/xpqwHcyy18g",
    caption: "video 2"
  },
  {
    link: "https://youtu.be/kWuUkNIqlM4?si=mP2eo5WCy4gM9GEw",
    embedUrl: "https://www.youtube.com/embed/kWuUkNIqlM4?si=mP2eo5WCy4gM9GEw",
    caption: "video 3"
  },
  {
    link: "https://youtu.be/9neoP97KxPQ?si=3ty61nympsiAHIkj",
    embedUrl: "https://www.youtube.com/embed/9neoP97KxPQ?si=3ty61nympsiAHIkj",
    caption: "video 4"
  },
  {
    link: "https://youtu.be/mbcEIm6l5rw?si=7fh_f2HYcPdynZB3",
    embedUrl: "https://www.youtube.com/embed/mbcEIm6l5rw?si=7fh_f2HYcPdynZB3",
    caption: "video 5"
  },
];