import React, { useEffect, useState } from "react";
import "../styles/MahaShivaratri.css";

import hero from "../images/hero.jpg";
import img1 from "../images/mahaabhishekam.jpg";
import img2 from "../images/eventhomam.jpg";
import img3 from "../images/Ganga-aarti.jpg";

const EVENT_DATE = new Date("2025-02-15T23:00:00");

const CONTENT = {
  en: {
    metaTitle: "Maha Shivaratri Special Pooja in Kashi | Live Video & Prasadam",
    metaDesc:
      "Participate in Maha Shivaratri Special Pooja at Kashi with live video, Rudrabhishekam, Homams, Ganga Aarti & prasadam delivery.",
    title: "Maha Shivaratri Special Pooja",
    location: "Kashi (Varanasi)",
    liveNote: "🔴 Live Pooja Video will be provided to all registered devotees.",
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
        a: "Yes. Physical presence is not required. You can participate remotely.",
      },
      {
        q: "Will live video of the pooja be provided?",
        a: "Yes. Live pooja video will be provided to all registered devotees.",
      },
      {
        q: "Who performs the pooja?",
        a: "Experienced Vedic priests perform the rituals as per Shastra.",
      },
      {
        q: "Is there any registration fee?",
        a: "Participation is free / donation based.",
      },
    ],
    register: "Register Now",
  },

  te: {
    metaTitle: "కాశీలో మహాశివరాత్రి ప్రత్యేక పూజ | ప్రత్యక్ష వీడియో & ప్రసాదం",
    metaDesc:
      "కాశీ క్షేత్రంలో మహాశివరాత్రి ప్రత్యేక పూజలో పాల్గొని ప్రత్యక్ష వీడియో, రుద్రాభిషేకం, హోమములు పొందండి.",
    title: "మహాశివరాత్రి ప్రత్యేక పూజ",
    location: "కాశీ (వారణాసి)",
    liveNote: "🔴 నమోదు చేసిన భక్తులందరికీ పూజ ప్రత్యక్ష వీడియో అందించబడుతుంది.",
    about:
      "మహాశివరాత్రి పరమశివునికి అంకితమైన పవిత్రమైన రాత్రి. కాశీ క్షేత్రంలో సంపూర్ణ వైదిక విధానంలో పూజ నిర్వహించబడుతుంది.",
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
    prasadam:
      "పూజ అనంతరం తీర్థ ప్రసాదాలు పోస్టు ద్వారా పంపబడును.",
    faq: [
      {
        q: "కాశీలో ప్రత్యక్షంగా ఉండాలా?",
        a: "అవసరం లేదు. దూరంగా నుండే పాల్గొనవచ్చు.",
      },
      {
        q: "పూజ ప్రత్యక్ష వీడియో ఇస్తారా?",
        a: "అవును. నమోదు చేసిన భక్తులకు ప్రత్యక్ష వీడియో అందించబడుతుంది.",
      },
      {
        q: "పూజ ఎవరు నిర్వహిస్తారు?",
        a: "అనుభవజ్ఞులైన వేద పండితులు నిర్వహిస్తారు.",
      },
      {
        q: "నమోదు ఫీజు ఉందా?",
        a: "పాల్గొనడం ఉచితం / దక్షిణ ఆధారితం.",
      },
    ],
    register: "పూజలో పాల్గొనండి",
  },
};

export default function MahaShivaratri() {
  const [lang, setLang] = useState("en");
  const [openFaq, setOpenFaq] = useState(null);
  const [time, setTime] = useState({});

  useEffect(() => {
    const i = setInterval(() => {
      const diff = EVENT_DATE - new Date();
      setTime({
        d: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        h: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
        m: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
        s: Math.max(0, Math.floor((diff / 1000) % 60)),
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const t = CONTENT[lang];

  return (
    <div className="vm-page">
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
      </Helmet>

      {/* Language Toggle */}
      <div className="vm-lang">
        <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
        <button onClick={() => setLang("te")} className={lang === "te" ? "active" : ""}>తెలుగు</button>
      </div>

      {/* Hero */}
      <div className="vm-hero">
        <img src={hero} alt="Maha Shivaratri" />
        <div className="vm-gallery">
          <img src={img1} alt="Rudrabhishekam" />
          <img src={img2} alt="Homam" />
          <img src={img3} alt="Ganga Aarti" />
        </div>
      </div>

      {/* Title */}
      <div className="vm-title">
        <h1>{t.title}</h1>
        <p>{t.location}</p>
        <div className="live-note">{t.liveNote}</div>
      </div>

      {/* Timer */}
      <div className="vm-timer">
        <div><span>{time.d}</span>Days</div>
        <div><span>{time.h}</span>Hrs</div>
        <div><span>{time.m}</span>Min</div>
        <div><span>{time.s}</span>Sec</div>
      </div>

      {/* Sections */}
      <section className="vm-section">
        <h2>About Pooja</h2>
        <p>{t.about}</p>
      </section>

      <section className="vm-section light">
        <h2>Pooja Benefits</h2>
        <ul>{t.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </section>

      <section className="vm-section">
        <h2>Pooja Procedure</h2>
        <ol>{t.procedure.map((p, i) => <li key={i}>{p}</li>)}</ol>
      </section>

      <section className="vm-section light">
        <h2>Prasadam</h2>
        <p>{t.prasadam}</p>
      </section>

      {/* FAQ ACCORDION */}
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

            {openFaq === i && (
              <div className="faq-answer">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <div className="vm-cta">
        <button>{t.register}</button>
      </div>
    </div>
  );
}
