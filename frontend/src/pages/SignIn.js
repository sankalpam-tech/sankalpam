import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Auth.css';
import { useAuth } from '../context/AuthContext';
import axios from "axios";

const SignIn = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  //--------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sign in:', formData);



    // 🔐 NORMAL USER LOGIN
    try {
      const res = await axios.post(
        "https://backend.sankalpam.world/auth/signin",
        formData,
        { withCredentials: true }
      );
      
      console.log("signin page",res.data)

      const { verify, msg, user } = res.data;

      if (verify) {
        login(user);
        window.alert(msg);
        navigate("/");
      } else {
        window.alert(msg);
      }
    } catch (err) {
      window.alert(err.response?.data?.msg || "Signin failed");
    }
  };

  //--------------------------------------------------------

  const handleGoogleSignIn = async () => {
    window.location.href = "https://backend.sankalpam.world/auth/google";
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#FFF8E1',
        minHeight: '100vh'
      }}
    >
      <Navbar activePage="signin" />

      <div className="signin-container">
        {/* Left side */}
        <div className="signin-left-panel">
          <div className="signin-bg-overlay"></div>
          <div
            className="signin-bg-image"
            style={{
              backgroundImage:
                'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCkmZABpmAT03CS0VcZD_CLC5CEho6VLlfaETlGu4br5i_vksYXPOtaBxjos8RfI4arN9zYhHl_-epmGiyqUTHYy2QK05gt9e6PDGK40L6jjJzU-pRPUvvoVdQRStQ-_YNnrIIpdpuNWSyEk9lkMbjVdvOTjUBh2fs_vUc18c4jHOIbwtMVu4MrIS7NfpZ65YxctkuWIJti7yZ6QlWUNwi5A3QobGl8JbrPiiLPZzfM4C5C3P_qTXc9QHEr8vv7fd3bykgxAkOhBTc)'
            }}
          ></div>
        </div>

        {/* Right side */}
        <div className="signin-right-panel">
          <div className="signin-form-container">
            <div className="signin-header-text">
              <h2 className="signin-title">Welcome Back</h2>
              <p className="signin-subtitle">
                Access your Pujas, Astrology reports, and more.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="signin-form">
              <div className="signin-form-group">
                <label className="signin-label">Email or Phone Number</label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className="signin-input"
                  placeholder="Enter your email or phone number"
                  required
                />
              </div>

              <div className="signin-form-group">
                <label className="signin-label">Password</label>
                <div className="signin-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="signin-input"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="signin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="signin-forgot-password">
                <Link to="/forgot" className="signin-link-secondary">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="signin-button-primary">
                Sign In
              </button>
            </form>

            <div className="signin-divider">
              <span>or continue with</span>
            </div>

            <div className="signin-social-buttons">
              <button
                type="button"
                className="signin-social-button"
                onClick={handleGoogleSignIn}
              >
                <span
                  className="signin-social-button-text"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C42 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
                  </svg>
                  Continue with Google
                </span>

              </button>

              <button type="button" className="signin-social-button">
                <span className="signin-social-button-text">
                  Continue with Facebook
                </span>
              </button>
            </div>

            <div className="signin-signup-link">
              <p>
                New to Sankalpam?{' '}
                <Link to="/signup" className="signin-link-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
