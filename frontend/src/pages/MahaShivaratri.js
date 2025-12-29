import React, { useEffect, useState } from "react";
import "../styles/MahaShivaratri.css";
import imgmain from "../images/hero.jpg";
import img1 from "../images/mahaabhishekam.jpg";
import img2 from "../images/eventhomam.jpg";
import img3 from "../images/Ganga-aarti.jpg";
import BookingPage from "./Bookingpage";

/* 🔒 RELIABLE DATE (IST) */
const EVENT_DATE = new Date(2025, 1, 15, 23, 0, 0); // Feb 15 11:00 PM

const GALLERY_IMAGES = [img1, imgmain, img2, img3];

const CONTENT = {
  en: {
    title: "Maha Shivaratri Special Pooja",
    location: "Kashi (Varanasi)",
    price: "₹1,611",
    priceNote: "Per Participation",
    liveNote:
      "🔴 Live Pooja Video will be provided to all registered devotees.",
    headings: {
      about: "About Pooja",
      benefits: "Pooja Benefits",
      procedure: "Pooja Procedure",
      prasadam: "Prasadam",
      faq: "FAQs",
    },
    about:
      "Maha Shivaratri is the most sacred night dedicated to Lord Shiva. This pooja is performed at the holy Kashi Kshetra following complete Vedic traditions.",
    benefits: [
      "Removal of negative karma and doshas",
      "Blessings of Lord Shiva",
      "Peace, prosperity and good health",
      "Spiritual upliftment",
    ],
    procedure: [
      "Guru Vandana & Ganapati Puja",
      "Ekadasha Rudrabhishekam with Panchamritas",
      "Laksha Bilva Archana",
      "Rudra, Chandi, Kalabhairava & Navagraha Homams",
      "Ganga Aarti at Rajghat",
      "Lingodbhava Kala Maha Rudrabhishekam",
    ],
    prasadam:
      "Sacred theertha prasadam will be sent by post to all registered devotees.",
    faq: [
      {
        q: "Can I participate without being present at Kashi?",
        a: "Yes. Physical presence is not required.",
      },
      {
        q: "Will live video be provided?",
        a: "Yes. Live pooja video will be provided.",
      },
      {
        q: "Who performs the pooja?",
        a: "Experienced Vedic priests perform the rituals.",
      },
      {
        q: "Is there any registration fee?",
        a: "The pooja participation amount is ₹1,611.",
      },
    ],
    register: "Register Now",
  },

  te: {
    title: "మహాశివరాత్రి ప్రత్యేక పూజ",
    location: "కాశీ (వారణాసి)",
    price: "₹1,611",
    priceNote: "ప్రతి పాల్గొనేవారికి",
    liveNote:
      "🔴 నమోదు చేసిన భక్తులందరికీ పూజ ప్రత్యక్ష వీడియో అందించబడుతుంది.",
    headings: {
      about: "పూజ వివరాలు",
      benefits: "పూజ ఫలితాలు",
      procedure: "పూజ విధానం",
      prasadam: "ప్రసాదం",
      faq: "తరచూ అడిగే ప్రశ్నలు",
    },
    about:
      "మహాశివరాత్రి పరమశివునికి అంకితమైన పవిత్రమైన రాత్రి. ఈ పూజ కాశీ క్షేత్రంలో సంపూర్ణ వైదిక విధానంలో నిర్వహించబడుతుంది.",
    benefits: [
      "కర్మ దోష నివారణ",
      "శివానుగ్రహం",
      "ఆరోగ్యం, శాంతి, ఐశ్వర్యం",
      "ఆధ్యాత్మిక పురోగతి",
    ],
    procedure: [
      "గురువందనం & గణపతి పూజ",
      "ఏకాదశ రుద్రాభిషేకం",
      "లక్ష బిల్వార్చన",
      "రుద్ర, చండీ, కాలభైరవ, నవగ్రహ హోమములు",
      "గంగా హారతి",
      "లింగోద్భవ కాల రుద్రాభిషేకం",
    ],
    prasadam: "పూజ అనంతరం తీర్థ ప్రసాదాలు పోస్టు ద్వారా పంపబడును.",
    faq: [
      {
        q: "కాశీలో ప్రత్యక్షంగా ఉండాలా?",
        a: "అవసరం లేదు. దూరంగా నుండే పాల్గొనవచ్చు.",
      },
      {
        q: "పూజ ప్రత్యక్ష వీడియో ఇస్తారా?",
        a: "అవును. ప్రత్యక్ష వీడియో అందించబడుతుంది.",
      },
      {
        q: "పూజ ఎవరు నిర్వహిస్తారు?",
        a: "అనుభవజ్ఞులైన వేద పండితులు.",
      },
      {
        q: "నమోదు ఫీజు ఎంత?",
        a: "పూజ పాల్గొనుటకు మొత్తం ₹1,611.",
      },
    ],
    register: "పూజలో పాల్గొనండి",
  },
};

export default function MahaShivaratri() {
  const [lang, setLang] = useState("en");
  const [openFaq, setOpenFaq] = useState(null);
  const [time, setTime] = useState({});
  const [currentImage, setCurrentImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  /* Countdown */
  useEffect(() => {
    const t = setInterval(() => {
      const diff = EVENT_DATE - new Date();
      setTime({
        d: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        h: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
        m: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
        s: Math.max(0, Math.floor((diff / 1000) % 60)),
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* Auto image slider */
  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentImage((prev) =>
        prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(slider);
  }, []);

  const t = CONTENT[lang];

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  // Prevent body scroll when booking modal is open
  useEffect(() => {
    if (showBookingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showBookingModal]);

  return (
    <div className="vm-page">
      {/* Language */}
      <div className="vm-lang">
        <button
          onClick={() => setLang("en")}
          className={lang === "en" ? "active" : ""}
        >
          EN
        </button>
        <button
          onClick={() => setLang("te")}
          className={lang === "te" ? "active" : ""}
        >
          తెలుగు
        </button>
      </div>

      {/* Image Carousel */}
      <div className="vm-hero">
        <img
          src={GALLERY_IMAGES[currentImage]}
          className="vm-main-image"
          alt="Maha Shivaratri"
        />
      </div>

      {/* Title */}
      <div className="vm-title">
        <h1>{t.title}</h1>
        <p>{t.location}</p>
        <div className="live-note">{t.liveNote}</div>

        <div className="vm-price-box">
          <div className="vm-price">{t.price}</div>
          <div className="vm-price-note">{t.priceNote}</div>
        </div>
      </div>

      {/* Countdown */}
      <div className="vm-timer">
        <div>
          <span>{time.d}</span>Days
        </div>
        <div>
          <span>{time.h}</span>Hrs
        </div>
        <div>
          <span>{time.m}</span>Min
        </div>
        <div>
          <span>{time.s}</span>Sec
        </div>
      </div>

      {/* Sections */}
      <section className="vm-section">
        <h2>{t.headings.about}</h2>
        <p>{t.about}</p>
      </section>

      <section className="vm-section light">
        <h2>{t.headings.benefits}</h2>
        <ul>
          {t.benefits.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="vm-section">
        <h2>{t.headings.procedure}</h2>
        <ol>
          {t.procedure.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </section>

      <section className="vm-section light">
        <h2>{t.headings.prasadam}</h2>
        <p>{t.prasadam}</p>
      </section>

      {/* FAQ */}
      <section className="vm-section">
        <h2>FAQs</h2>
        {t.faq.map((f, i) => (
          <div className="faq-accordion" key={i}>
            <div
              className="faq-question"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {f.q}
              <span>{openFaq === i ? "−" : "+"}</span>
            </div>
            {openFaq === i && <div className="faq-answer">{f.a}</div>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <div className="vm-cta">
        <button onClick={() => setShowBookingModal(true)}>{t.register}</button>
      </div>

      {/* Booking Modal Overlay */}
      {showBookingModal && (
        <div
          className="booking-modal-overlay"
          onClick={handleCloseBookingModal}
        >
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="booking-modal-close"
              onClick={handleCloseBookingModal}
            >
              ×
            </button>
            <BookingPage
              puja={{
                name: t.title,
                price: t.price,
              }}
              onBack={handleCloseBookingModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}