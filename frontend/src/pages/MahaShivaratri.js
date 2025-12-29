import React from "react";
import "../styles/MahaShivaratri.css";


const MahaShivaratri = () => {
  return (
    <div className="pooja-details-page">

      {/* Hero */}
      <section className="hero-section">
        <img 
          src="https://example.com/hero-maha-shivaratri.jpg" 
          alt="Maha Shivaratri Celebration" 
          className="hero-img"
        />
        <div className="hero-text">
          <h1>🌺 Maha Shivaratri Spiritual Celebration 🌺</h1>
          <p>At the Sacred Kashi — Feb 15</p>
          <p className="price">Special Event — Free / Donate Your Blessings</p>
        </div>
      </section>

      {/* Overview */}
      <section className="overview-section">
        <h2>About the Event</h2>
        <p>
          Join this sacred Maha Shivaratri celebration in Kashi with
          complete Vedic rituals, Rudrabhishekam, Homams, Ganga Aarti
          and Lingodbhava observance — conducted by learned priests
          with devotion and purity.
        </p>
      </section>

      {/* Benefits */}
      <section className="benefits-section">
        <h2>✨ Event Benefits</h2>
        <ul>
          <li>Invoke Lord Shiva’s Blessings for peace and prosperity</li>
          <li>Experience powerful Rudrabhishekam & Homams</li>
          <li>Receive Theertha Prasad mailed to your home</li>
          <li>Participate even remotely</li>
          <li>Enhance spiritual growth & inner peace</li>
        </ul>
      </section>

      {/* Detailed Program */}
      <section className="program-section">
        <h2>🕉️ Detailed Program</h2>

        <div className="program-block">
          <h3>🌅 6:00 AM</h3>
          <p>Ganapati Puja, Punyahavachanam, Guru Vandana & Raksha Bandhanam</p>
        </div>

        <div className="program-block">
          <h3>⏰ 7:30 AM</h3>
          <p>Mahaanayas Parayanam & Ekadasha Rudrabhishekam</p>
        </div>

        <div className="program-block">
          <h3>⏰ 9:00 AM</h3>
          <p>Laksha Bilvarchan, Rudra Trishati, Neerajan & Theertha Prasad</p>
        </div>

        <div className="program-block">
          <h3>🕉️ 11:00 AM</h3>
          <p>Rudra Homam, Chandi Homam, Kalabhairava Homam & Navagraha Homam</p>
        </div>

        <div className="program-block">
          <h3>🌇 5:30 PM</h3>
          <p>Ganga Aarti at Rajghat</p>
        </div>

        <div className="program-block">
          <h3>🌙 11:00 PM</h3>
          <p>Lingodbhava Kala Maha Shivaratri Rudrabhishekam</p>
        </div>
      </section>

      {/* Process */}
      <section className="process-section">
        <h2>🛕 Ritual Process</h2>
        <p>
          The event includes Vedic chanting, homams, floral offerings,
          sacred fire rituals, and Ganga Aarti. All rituals are
          performed as per shastra and tradition to invoke Lord Shiva’s
          divine grace.
        </p>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>

        <div className="faq-item">
          <h4>Can I participate remotely?</h4>
          <p>Yes, you can participate from anywhere & receive Theertha Prasad.</p>
        </div>

        <div className="faq-item">
          <h4>Will I receive proof of rituals?</h4>
          <p>Yes — video/photo proofs are shared where available.</p>
        </div>

        <div className="faq-item">
          <h4>Is there any charge?</h4>
          <p>Participation is free — donations are welcome.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <button className="cta-btn">Participate / Register Now</button>
      </section>

    </div>
  );
};

export default MahaShivaratri;
