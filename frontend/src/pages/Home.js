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

function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const audioRef = useRef(null);

  // Detect screen size for carousel
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Carousel navigation functions
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

  // Auto-rotate carousel on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const interval = setInterval(() => {
      nextVideo();
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, currentVideoIndex]);

  return (
    <div className="home-wrapper">
      <Navbar/>

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

      {/* ========================= HERO ========================= */}
      <section className="hero">
        <h1>Connect with the Divine, Anywhere</h1>
        <p>Your spiritual journey begins with Sankalpam. Experience authentic rituals, expert guidance, and divine connections from the comfort of your home.</p>
        <button className="btn-primary" onClick={scrollToServices}>
          Explore Our Services
          <FaArrowRight style={{ marginLeft: '10px' }} />
        </button>
      </section>

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

      {/* ========================= EVENTS ========================= */}
      <section className="section">
        <h2 className="section-title">Upcoming Events</h2>

        <div className="events-container">
          <div className="events-list">
            {events.map((e, i) => (
              <Link to={e.cta === "View Details" ? "/details" : "/register"} className="event-card" key={i}>
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

      <Footer/>

    </div>
  );
}

export default Home;

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
  {
    title: "Astrology",
    desc: "Insights from expert Vedic astrologers. Personalized guidance for life decisions.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLpEGJcbpu9LVHVw2qmEfC2dZ0iGTbCkefim5-5HTL603WFJ4VShvYuyLU4WRq2UKpw8gKOflwyO6hHtX90MwH2MOmfeuk0cxe2nxTSFVyt52BEFW4Te6k3iz6GWrRYeg5QiCS5BChpM1RHlvSe_jUQYTNOZhb6xbeQm8qQpMmR_p8-bMIQkQe1Q0NloB6LHKb5ns5sw0I9jr9U6mGT2MjE_Fy1c6TTuR85IkLUbN_znjIBhSBmBEUqyufwO9KtljkDsJ80Q7fAlw",
    link: "/astrology"
  },
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
    date: "28",
    month: "OCT",
    title: "Diwali Lakshmi Puja",
    desc: "A special Lakshmi Mata Puja for blessings of wealth and prosperity.",
    cta: "View Details"
  },
  {
    date: "15",
    month: "NOV",
    title: "Ganga Aarti Live",
    desc: "Experience the sacred Ganga Aarti from Varanasi with interactive participation.",
    cta: "Register Now"
  },
  {
    date: "04",
    month: "DEC",
    title: "Hanuman Chalisa Recital",
    desc: "Participate in a powerful devotional event with 108 Hanuman Chalisa recitations.",
    cta: "Register Now"
  },
  {
    date: "10",
    month: "DEC",
    title: "Rudrabhishekam",
    desc: "Holy ritual dedicated to Lord Shiva for peace, prosperity, and spiritual growth.",
    cta: "View Details"
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