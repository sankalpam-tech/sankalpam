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

function Pujas() {
  const [bookingMode, setBookingMode] = useState("online");
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [openDropdown, setOpenDropdown] = useState(null); // which card's "view more" is open

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = bgimg;
  }, []);

  const allPujas = [
    {
      id: 1,
      name: "Satyanarayana Puja",
      description: "For prosperity and well-being.",
      price: "₹5100",
      image: img1,
    },
    {
      id: 2,
      name: "Griha Pravesh Puja",
      description: "For blessings in a new home.",
      price: "₹7500",
      image: img2,
    },
    {
      id: 3,
      name: "Lakshmi Ganesh Puja",
      description: "For wealth and success.",
      price: "₹4100",
      image: img3,
    },
    {
      id: 4,
      name: "Maha Mrityunjaya Jaap",
      description: "For health and longevity.",
      price: "₹11000",
      image:img8,
    },
    {
      id: 5,
      name: "Rudrabhishek Puja",
      description: "For divine blessings and peace.",
      price: "₹4500",
      image: img4,
    },
    {
      id: 6,
      name: "Lakshmi Kubera Puja",
      description: "For prosperity and stability.",
      price: "₹6500",
      image: img5,
    },
    {
      id: 7,
      name: "Ganapati Homam",
      description: "For new beginnings and success.",
      price: "₹3800",
      image: img6,
    },
    {
      id: 8,
      name: "Navagraha Puja",
      description: "For balancing planetary influences.",
      price: "₹5100",
      image: img7,
    },
  ];

  const onlinePujas = allPujas.slice(0, 4);
  const offlinePujas = allPujas.slice(4, 8);
  const displayedPujas = bookingMode === "online" ? onlinePujas : offlinePujas;

  const inclusions = [
    "Puja Samagri",
    "Pandit Dakshina",
    "Live Streaming",
    "Prasadam Delivery",
  ];

  const handleBookNow = (puja) => {
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

      {/* Hero section (card over background) */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Book Your Sacred Pujas Online</h1>
          <p className="hero-description">
            Experience the sanctity and convenience of performing authentic
            Hindu rituals from the comfort of your home.
          </p>
          <button className="btn-explore">Explore Pujas</button>
        </div>
      </section>

      {/* Puja Cards */}
      <section className="puja-offerings" id="pujas">
        <h2 className="section-title">Our Puja Offerings</h2>
        
        {/* Online/Offline Tabs - Modern Design */}
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

        <div className="puja-grid">
          {displayedPujas.map((puja) => (
            <div key={puja.id} className="puja-card">
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
                      setOpenDropdown(
                        openDropdown === puja.id ? null : puja.id
                      )
                    }
                  >
                    View more
                  </button>
                </div>

                <div className="puja-footer">
                  <span className="puja-price">{puja.price}</span>
                  <button
                    className="btn-book"
                    onClick={() => handleBookNow(puja)}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Card‑local overlay, does not affect other cards */}
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
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Pujas;