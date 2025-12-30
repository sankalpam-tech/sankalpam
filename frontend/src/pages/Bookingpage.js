
import React, { useState } from "react";
import "../styles/Bookingpage.css";
import QRImage from "../images/QR.jpg";
import axios from "axios";

function Bookingpage({ puja, onBack, type = "puja" }) {
  const isAstrology = type === "astrology";

  const [pujaForm, setPujaForm] = useState({
    kartaName: "",
    wifeName: "",
    familyMembers: "",
    gothram: "",
    phone: "",
    referral: "",
    address: "",
    transactionId: "",
    pujaName: puja?.name || "Satyanarayan Puja",
    price: puja?.price || "₹2501",
  });

  const handleChange = (e) => {
    setPujaForm({
      ...pujaForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAstrology) return;

    const cleanedData = {
      ...pujaForm,
      kartaName: pujaForm.kartaName.trim(),
      wifeName: pujaForm.wifeName.trim(),
      familyMembers: pujaForm.familyMembers.trim(),
      gothram: pujaForm.gothram.trim(),
      phone: pujaForm.phone.trim(),
      referral: pujaForm.referral.trim(),
      address: pujaForm.address.trim(),
      transactionId: pujaForm.transactionId.trim(),
    };

    console.log("Final Puja Data:", cleanedData);

    try {
      await axios.post(
        "http://localhost:5000/auth/puja-booking",
        cleanedData
      );
      alert("Booking submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

return (
  <div className="bp-root">
    {/* Top Navigation */}

    <main className="bp-page-content">
      <section className="bp-booking-wrapper">
        <h1 className="bp-page-title">
          {isAstrology ? "Book Your Consultation" : "Book Your Puja"}
        </h1>

        {/* Selected Puja Card */}
        <div className="bp-puja-card">
          <div className="bp-puja-card-inner">
            <h2 className="bp-puja-name">
              {puja?.name || "Satyanarayan Puja"}
            </h2>
            <p className="bp-puja-subtitle">
              {isAstrology
                ? "You are booking this consultation"
                : "You are booking this puja"}
            </p>
            <p className="bp-puja-cost">Cost: {puja?.price || "₹2501"}</p>
          </div>
        </div>

        {/* Form */}
        <section className="bp-form-section">
          <h2 className="bp-form-title">
            {isAstrology
              ? "Enter Your Details"
              : "Enter Your Details for the Sankalpam"}
          </h2>

          <form
            form className="bp-booking-form" onSubmit={handleSubmit}
          >
            {isAstrology ? (
              // Astrology Form Fields
              <>
                {/* Row 1 - Name and DOB */}
                <div className="bp-form-row">
                  <div className="bp-form-field">
                    <label>
                      Your Name<span className="bp-required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="bp-form-field">
                    <label>
                      Date of Birth<span className="bp-required">*</span>
                    </label>
                    <input type="date" required />
                  </div>
                </div>

                {/* Row 2 - Birth Time and Birth Place */}
                <div className="bp-form-row">
                  <div className="bp-form-field">
                    <label>
                      Birth Time<span className="bp-required">*</span>
                    </label>
                    <input type="time" required />
                  </div>
                  <div className="bp-form-field">
                    <label>
                      Birth Place<span className="bp-required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your birth place"
                      required
                    />
                  </div>
                </div>

                {/* Row 3 - Father's Name and Phone */}
                <div className="bp-form-row">
                  <div className="bp-form-field">
                    <label>
                      Father's Name<span className="bp-required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                  <div className="bp-form-field">
                    <label>
                      Your Phone Number<span className="bp-required">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your 10-digit number"
                      required
                    />
                  </div>
                </div>

                {/* Row 4 - Other (Full Width) */}
                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width">
                    <label>Other Information</label>
                    <textarea
                      rows="4"
                      placeholder="Any additional details you'd like to share..."
                    />
                  </div>
                </div>
              </>
            ) : (
              // Puja Form Fields (Original)
              <>
                {/* Row 1 */}
                <div className="bp-form-row">
                  <div className="bp-form-field">
                    <label>
                      Your Name (Karta)<span className="bp-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="kartaName"
                      value={pujaForm.kartaName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="bp-form-field">
                    <label>Wife&apos;s Name</label>
                    <input type="text" placeholder="Optional" name="wifeName" value={pujaForm.wifeName} onChange={handleChange} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width">
                    <label>Other Family Members&apos; Names</label>
                    <input
                      type="text"
                      placeholder="e.g., Children, Parents (Optional)"
                      name="familyMembers"
                      value={pujaForm.familyMembers}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="bp-form-row">
                  <div className="bp-form-field">
                    <label>
                      Gothram<span className="bp-required">*</span>
                      <span
                        className="bp-info-icon"
                        title="Your family lineage"
                      />
                    </label>
                    <input
                      type="text"
                      name="gothram"
                      value={pujaForm.gothram}
                      onChange={handleChange}
                      placeholder="Enter your Gothram"
                      required
                    />
                  </div>
                  <div className="bp-form-field">
                    <label>
                      Phone Number<span className="bp-required">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={pujaForm.phone}
                      onChange={handleChange}
                      placeholder="Enter your 10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width">
                    <label>Referral </label>
                    <input
                      type="text"
                      name="referral"
                      value={pujaForm.referral}
                      onChange={handleChange}
                      placeholder="Enter your Referral" />
                  </div>
                </div>
                {/* Row 4 */}
                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width">
                    <label>
                      Prasadam Delivery Address
                      <span className="bp-required">*</span>
                    </label>
                    <textarea
                      rows="3"
                      name="address"
                      value={pujaForm.address}
                      onChange={handleChange}
                      placeholder="Enter your full address for Prasadam delivery"
                      required
                    />
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width bp-qr-section">
                    <label className="bp-qr-label">Scan QR Code to Pay</label>
                    <div className="bp-qr-container">
                      <img
                        src={QRImage}
                        alt="UPI Payment QR Code"
                        className="bp-qr-image"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = QRImage;
                          link.download = "Sankalpam_UPI_QR_Code.jpg";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{ cursor: "pointer" }}
                        title="Click to download QR code"
                      />
                      <div className="bp-upi-details">
                        <p className="bp-upi-name">SREENIVASULU</p>
                        <p className="bp-upi-id">
                          <strong>UPI ID:</strong> sir8456@axisbank
                        </p>
                        <p className="bp-upi-number">
                          <strong>UPI Number:</strong> 9493168456
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction ID Field */}
                <div className="bp-form-row">
                  <div className="bp-form-field bp-full-width">
                    <label>
                      Enter Transaction ID
                      <span className="bp-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={pujaForm.transactionId}
                      onChange={handleChange}
                      placeholder="Enter your transaction ID after payment"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Pay button */}
            <div className="bp-pay-wrapper">
              <button type="submit" className="bp-pay-btn">
                Pay Now
              </button>
              <p className="bp-pay-note">Secure payment powered by Stripe</p>
            </div>
          </form>
        </section>
      </section>
    </main>

    <footer className="bp-page-footer">
      <div className="bp-footer-inner">
        <p className="bp-footer-copy">
          © 2024 Sankalpam. All Rights Reserved.
        </p>
        <div className="bp-footer-links">
          <button>Privacy Policy</button>
          <span className="bp-footer-sep">|</span>
          <button>Terms of Service</button>
          <span className="bp-footer-sep">|</span>
          <button>Contact Us</button>
        </div>
      </div>
    </footer>
  </div>
);
}

export default Bookingpage;
