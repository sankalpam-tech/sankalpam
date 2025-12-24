import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotMail = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "https://backend.sankalpam.world/auth/otp",
        { emailOrPhone: value }
      );
        // 🔑 SAVE EMAIL / PHONE FOR NEXT STEPS
        localStorage.setItem("recovery", value);
      if (res.data.success === true) {
        alert("OTP sent");
        navigate("/otp");
        setValue("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== STYLES ===================== */

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#221910",
      color: "#ffffff",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      display: "flex",
      flexDirection: "column",
    },

    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 24px",
      borderBottom: "1px solid #684d31",
    },

    logo: {
      fontSize: "20px",
      fontWeight: "700",
    },

    navButtons: {
      display: "flex",
      gap: "12px",
    },

    signInBtn: {
      height: "40px",
      padding: "0 24px",
      borderRadius: "9999px",
      border: "1px solid #f27f0d",
      background: "transparent",
      color: "#f27f0d",
      fontWeight: "700",
      cursor: "pointer",
    },

    signUpBtn: {
      height: "40px",
      padding: "0 24px",
      borderRadius: "9999px",
      border: "none",
      backgroundColor: "#f27f0d",
      color: "#221910",
      fontWeight: "700",
      cursor: "pointer",
    },

    main: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
    },

    card: {
      width: "100%",
      maxWidth: "520px",
      background: "rgba(52, 38, 24, 0.7)",
      backdropFilter: "blur(12px)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    },

    iconWrapper: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      border: "1px solid #684d31",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
    },

    title: {
      fontSize: "28px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "12px",
    },

    subtitle: {
      fontSize: "14px",
      color: "#b0b0b0",
      textAlign: "center",
      marginBottom: "32px",
    },

    label: {
      fontSize: "14px",
      marginBottom: "8px",
      display: "block",
      paddingLeft: "16px",
      color: "#d1d1d1",
    },

    input: {
      width: "100%",
      height: "56px",
      borderRadius: "9999px",
      border: "1px solid #684d31",
      backgroundColor: "#342618",
      color: "#ffffff",
      padding: "0 20px",
      fontSize: "15px",
      outline: "none",
    },

    submitBtn: {
      width: "100%",
      height: "56px",
      marginTop: "24px",
      borderRadius: "9999px",
      border: "none",
      background: "linear-gradient(90deg, #f27f0d, #ff9f43)",
      color: "#221910",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
    },

    divider: {
      textAlign: "center",
      margin: "32px 0",
      color: "#888",
      fontSize: "14px",
    },

    backBtn: {
      background: "none",
      border: "none",
      color: "#d1d1d1",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      margin: "0 auto",
    },
  };

  /* ===================== JSX ===================== */

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.logo}>Sankalpam</div>

        <div style={styles.navButtons}>
          <button style={styles.signInBtn} onClick={() => navigate("/signin")}>
            Sign In
          </button>
          <button style={styles.signUpBtn} onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.card}>
          <div style={styles.iconWrapper}>
            🔒
          </div>

          <h1 style={styles.title}>Forgot Password?</h1>
          <p style={styles.subtitle}>
            Enter your email or phone number to recover your account
          </p>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email or Phone Number</label>
            <input
              style={styles.input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="devotee@sankalpam.com"
              required
            />

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Sending..." : "Send Recovery Code"}
            </button>
          </form>

          <div style={styles.divider}>Or</div>

          <button style={styles.backBtn} onClick={() => navigate("/signin")}>
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotMail;
