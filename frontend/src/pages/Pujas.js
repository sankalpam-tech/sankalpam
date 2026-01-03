import React, { useState, useEffect } from "react";
import "../styles/Pujas.css";
import BookingPage from "../pages/Bookingpage";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import bgimg from "../images/86-Meenakshi-Amman-Temple-01_credit-Shutterstock.jpg";

import img1 from "../images/Satyanarayan-Puja-Online-for-Griha-Pravesh-1024x576.jpg";
import img2 from "../images/Graha-Pravesham-1.jpg";
import img3 from "../images/e97a6d57620acf50b4846f024db1c1c8.jpg";
import img4 from "../images/rudrabhishek-1.webp";
import img6 from "../images/Homam.jpg";
import img5 from "../images/Lakshmi-Kuberan-Pooja.jpg";
import img7 from "../images/navgraha-puja.webp";
import img8 from "../images/OIP.jpg";

const HERO_IMAGES = [
  img1, // Satyanarayana Puja
  img2, // Griha Pravesh
  img4, // Rudrabhishek
  img6, // Ganapati Homam
];

function Pujas() {
  const [bookingMode, setBookingMode] = useState("online");
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // NEW
  const [slideIndex, setSlideIndex] = useState(0);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = bgimg;
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((idx) => (idx + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const allPujas = [
    {
      id: 1,
      name: "Satyanarayana Puja",
      description: "For prosperity and well-being.",
      price: "₹2000",
      image: img1,
    },
    {
      id: 2,
      name: "Griha Pravesh Puja",
      description: "For blessings in a new home.",
      price: "₹3000",
      image: img2,
    },
    {
      id: 3,
      name: "Lakshmi Ganesh Puja",
      description: "For wealth and success.",
      price: "₹3000",
      image: img3,
    },
    {
      id: 4,
      name: "Maha Mrityunjaya Jaap",
      description: "For health and longevity.",
      price: "₹2500",
      image: img8,
    },
    {
      id: 5,
      name: "Rudrabhishek Puja",
      description: "For divine blessings and peace.",
      price: "₹3000",
      image: img4,
    },
    {
      id: 6,
      name: "Lakshmi Kubera Puja",
      description: "For prosperity and stability.",
      price: "₹2500",
      image: img5,
    },
    {
      id: 7,
      name: "Ganapati Homam",
      description: "For new beginnings and success.",
      price: "₹3000",
      image: img6,
    },
    {
      id: 8,
      name: "Navagraha Puja",
      description: "For balancing planetary influences.",
      price: "₹3000",
      image: img7,
    },
  ];

  const onlinePujas = allPujas.slice(0, 4);
  const offlinePujas = allPujas.slice(4, 8);

  // ------ SEARCH FILTERING ------
  const filterPujas = (list) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((puja) =>
      `${puja.name} ${puja.description}`.toLowerCase().includes(term)
    );
  };

  const filteredOnlinePujas = filterPujas(onlinePujas);
  const filteredOfflinePujas = filterPujas(offlinePujas);
  const displayedPujas =
    bookingMode === "online" ? filteredOnlinePujas : filteredOfflinePujas;
  // -------------------------------

  const inclusions = [
    "Puja Samagri",
    "Pandit Dakshina",
    "Live Streaming",
    "Prasadam Delivery",
  ];

  const handleBookNow = (puja) => {
    // alert("this feature is coming soon!");
    setSelectedPuja(puja);
    setCurrentPage("booking");
  };

  const handleCloseModal = () => {
    setCurrentPage("home");
    setSelectedPuja(null);
  };

  // Prevent body scroll when booking modal is open
  useEffect(() => {
    if (currentPage === "booking" && selectedPuja) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [currentPage, selectedPuja]);

  // Scroll animation: cards appear when scrolled down, disappear when scrolled up
  useEffect(() => {
    const cards = document.querySelectorAll(".scroll-animated");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [displayedPujas, searchTerm, bookingMode]);

  // Single puja card (used for both desktop and mobile)
  const renderPujaCard = (puja) => (
    <div key={puja.id} className="puja-card scroll-animated">
      <div className="puja-image-container">
        <img src={puja.image} alt={puja.name} className="puja-image" />
      </div>

      <div className="puja-content">
        <h3 className="puja-name">{puja.name}</h3>
        <p className="puja-description">{puja.description}</p>

        <div className="puja-dropdown-container">
          <button
            className="puja-dropdown-btn"
            onClick={() =>
              setOpenDropdown(openDropdown === puja.id ? null : puja.id)
            }
          >
            View more
          </button>
        </div>

        <div className="puja-footer">
          <span className="puja-price">{puja.price}</span>
          <button className="btn-book" onClick={() => handleBookNow(puja)}>
            Book Now
          </button>
        </div>
      </div>

      {openDropdown === puja.id && (
        <div className="puja-details-overlay">
          <div className="puja-details-box">
            <button
              className="puja-details-close"
              onClick={() => setOpenDropdown(null)}
            >
              ×
            </button>
            <h4 className="inclusions-title">What&apos;s included</h4>
            <ul className="inclusions-list">
              {inclusions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="App pujas-page"
      style={{
        backgroundImage: `linear-gradient(
  rgba(255, 255, 255, 0.5),
  rgba(255, 255, 255, 0.5)
), url(${bgimg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Booking Modal Overlay */}
      {currentPage === "booking" && selectedPuja && (
        <div className="booking-modal-overlay" onClick={handleCloseModal}>
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="booking-modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <BookingPage puja={selectedPuja} onBack={handleCloseModal} />
          </div>
        </div>
      )}

      {/* Header */}
      <Navbar activePage="pujas" />

      {/* Search bar below navbar */}
      <div className="puja-search-wrapper">
        <div className="puja-search-inner">
          <div className="puja-search-box">
            <span className="puja-search-icon" role="img" aria-label="Search">
              🔍
            </span>
            <input
              type="text"
              className="puja-search-input"
              placeholder="Search for pujas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Hero section */}
      <section className="hero-banner-wrapper">
        <div className="hero-banner-container">
          <div className="hero-carousel">
            <div
              className="hero-carousel-track"
              style={{
                transform: `translateX(-${25 * slideIndex}%)`,
              }}
            >
              {HERO_IMAGES.map((src, idx) => (
                <div
                  key={idx}
                  className="hero-carousel-slide"
                  style={{
                    backgroundImage: `url(${src})`,
                  }}
                  aria-hidden={slideIndex !== idx}
                >
                  <div className="hero-carousel-overlay"></div>
                </div>
              ))}
            </div>

            {/* Content Overlay */}
            <div className="hero-content">
              <h1 className="hero-title">Book Your Sacred Pujas Online</h1>
              <p className="hero-description">
                Experience the sanctity and convenience of performing authentic
                Hindu rituals from the comfort of your home.
              </p>
              <button className="btn-explore">Explore Pujas</button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() =>
                setSlideIndex(
                  (idx) => (idx - 1 + HERO_IMAGES.length) % HERO_IMAGES.length
                )
              }
              aria-label="Previous slide"
              className="hero-carousel-btn hero-carousel-btn-prev"
            >
              {"<"}
            </button>
            <button
              onClick={() =>
                setSlideIndex((idx) => (idx + 1) % HERO_IMAGES.length)
              }
              aria-label="Next slide"
              className="hero-carousel-btn hero-carousel-btn-next"
            >
              {">"}
            </button>
          </div>
        </div>
      </section>

      {/* Puja Cards */}
      <section className="puja-offerings" id="pujas">
        <h2 className="section-title">Our Puja Offerings</h2>

        {/* Toggle: Online / Offline – visible on all devices */}
        <div className="booking-options">
          <div className="booking-tabs-container">
            <button
              className={`booking-tab ${
                bookingMode === "online" ? "active" : ""
              }`}
              onClick={() => setBookingMode("online")}
            >
              <span className="tab-icon">🌐</span>
              <span className="tab-text">Online Pujas</span>
            </button>
            <button
              className={`booking-tab ${
                bookingMode === "offline" ? "active" : ""
              }`}
              onClick={() => setBookingMode("offline")}
            >
              <span className="tab-icon">🏠</span>
              <span className="tab-text">Offline Pujas</span>
            </button>
          </div>
        </div>

        {searchTerm.trim() && displayedPujas.length === 0 && (
          <p className="puja-search-empty">
            No pujas found for &quot;{searchTerm}&quot; in{" "}
            {bookingMode === "online" ? "Online" : "Offline"} Pujas.
          </p>
        )}

        {/* Grid for both desktop and mobile. */}
        <div className="puja-grid">{displayedPujas.map(renderPujaCard)}</div>
      </section>

      <Footer />
    </div>
  );
}

export default Pujas;
