import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import astrologyBg from "../images/astrology.jpg";

const Astrology = () => {
  // Preload background image
  React.useEffect(() => {
    const img = new Image();
    img.src = astrologyBg;
  }, []);

  const handleBookConsultation = (service) => {
    alert(`Booking ${service?.title || 'General Consultation'}. This will redirect to the booking form.`);
    // TODO: Implement booking navigation
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
          backgroundColor: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '60px',
          position: 'relative',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
            <h1 style={{
              color: '#fff',
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              maxWidth: '800px',
              lineHeight: '1.2'
            }}>
              Unlock Your Destiny: Divine Guidance Through Vedic Astrology
            </h1>
            <p style={{
              color: '#fff',
              fontSize: '16px',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Navigate life's journey with clarity and confidence. Our expert astrologers are here to illuminate your path.
            </p>
            <button onClick={() => handleBookConsultation()} style={{
              padding: '14px 32px',
              backgroundColor: '#c41e3a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>Book a Consultation</button>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
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
              <div key={i} style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#4a6560',
                  backgroundImage: `url(${service.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#000'
                  }}>{service.title}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    flexGrow: 1
                  }}>{service.desc}</p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#c41e3a'
                    }}>{service.price}</span>
                    <button onClick={() => handleBookConsultation(service)} style={{
                      padding: '10px 20px',
                      backgroundColor: '#c41e3a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS SECTION */}
        <section style={{ marginBottom: '80px', backgroundColor: '#fff', padding: '60px 40px', borderRadius: '16px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '56px',
            color: '#000'
          }}>Your Path to Clarity in 3 Simple Steps</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px',
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
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
              <div key={i} style={{
                textAlign: 'center',
                padding: '32px 24px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ffe0e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>{step.icon}</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#000'
                }}>{step.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.6'
                }}>{step.desc}</p>
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
    </div>
  );
};

export default Astrology;
