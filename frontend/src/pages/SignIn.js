import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Auth.css';

const SignIn = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in:', formData);
    
    // Check for admin credentials
    if (formData.emailOrPhone === 'admin@sankalpam.com' && formData.password === 'admin123') {
      const adminData = {
        name: 'Admin',
        email: 'admin@sankalpam.com',
        phone: '+91 12345 67890',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXSWNSD-TfjJ3e-G0No5d816fUMAmtVaol6EVqBuAObNz7QpgCNniGjfDPBofaUl3o7dz6Jk1oOohR6P36QutU4l_xbP2a-tiKikIMARCJeEXBs3GEKM9ASE6v5QKmZSPzZuOvfyuecyar_zLUg0tYP4qAxy5yP_DB9vk_X6T2DMwiA_WUNVv3EOrIcLs_W8ez7RDhUl23eUkLPNmVIULHoyZ_kFmVRQm9h9tOTSQX1-IY-cvsG5MYcxxvZGVCKLY0ezdegnAIAnc'
      };
      login(adminData);
      navigate('/admin');
      return;
    }
    
    // Simulate successful login (replace with actual API call)
    const userData = {
      name: formData.emailOrPhone.includes('@') 
        ? formData.emailOrPhone.split('@')[0] 
        : 'User',
      email: formData.emailOrPhone.includes('@') 
        ? formData.emailOrPhone 
        : `${formData.emailOrPhone}@phone.com`,
      phone: formData.emailOrPhone.includes('@') 
        ? '+91 98765 43210' 
        : formData.emailOrPhone,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALhhL-qYGEBcC8GUWO91Tm-7k5xamOPslJY-NkC5UgF23olSjnkfa_rx5d3i0LRz42bu6LSEJOY5dw-7PIA2p0HE3VyAcs-RLcMVVNHa0j9tl42boRWN5qNcAerSDtygJFerU6FB42iSxeryQcucdwYd841korXE-wzVNv2iNcSMr2FFglAC_fKv24kJBSTWfXlVYJ-OyyS2jxArMsoJ3NDUAdlYje55oV4ETSWvUPErjYK5iYXXxO3anZWONKFol4o7O1p6rNC1g'
    };
    
    login(userData);
    navigate('/profile');
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign In will be integrated');
  };

  const handleFacebookSignIn = () => {
    alert('Facebook Sign In will be integrated');
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#FFF8E1', minHeight: '100vh' }}>
      <Navbar activePage="signin" />
      
      <div className="signin-container">
        {/* Left side - decorative background (hidden on mobile) */}
        <div className="signin-left-panel">
          <div className="signin-bg-overlay"></div>
          <div 
            className="signin-bg-image" 
            style={{
              backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCkmZABpmAT03CS0VcZD_CLC5CEho6VLlfaETlGu4br5i_vksYXPOtaBxjos8RfI4arN9zYhHl_-epmGiyqUTHYy2QK05gt9e6PDGK40L6jjJzU-pRPUvvoVdQRStQ-_YNnrIIpdpuNWSyEk9lkMbjVdvOTjUBh2fs_vUc18c4jHOIbwtMVu4MrIS7NfpZ65YxctkuWIJti7yZ6QlWUNwi5A3QobGl8JbrPiiLPZzfM4C5C3P_qTXc9QHEr8vv7fd3bykgxAkOhBTc)'
            }}
          ></div>
        </div>

        {/* Right side - sign in form */}
        <div className="signin-right-panel">
          <div className="signin-form-container">
            <div className="signin-header-text">
              <h2 className="signin-title">Welcome Back</h2>
              <p className="signin-subtitle">Access your Pujas, Astrology reports, and more.</p>
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
                <Link to="/forgot-password" className="signin-link-secondary">
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
                <svg className="signin-social-icon" viewBox="0 0 24 24">
                  <path d="M22.5777 12.2578C22.5777 11.4178 22.5077 10.6078 22.3877 9.81785H12.0077V14.4378H18.1077C17.8477 16.0178 17.0377 17.3378 15.7977 18.2178V20.7678H19.5077C21.4977 18.9878 22.5777 15.9078 22.5777 12.2578Z" fill="#4285F4"/>
                  <path d="M12.0077 23.0001C15.2477 23.0001 17.9477 21.9201 19.5077 20.7601L15.7977 18.2101C14.7277 18.9101 13.4677 19.3301 12.0077 19.3301C9.28773 19.3301 6.96773 17.5201 6.09773 15.0101H2.27773V17.6201C3.83773 20.7501 7.64773 23.0001 12.0077 23.0001Z" fill="#34A853"/>
                  <path d="M6.09766 15.01C5.87766 14.31 5.74766 13.57 5.74766 12.8C5.74766 12.03 5.87766 11.29 6.09766 10.59V7.98H2.27766C1.51766 9.49 1.00766 11.1 1.00766 12.8C1.00766 14.5 1.51766 16.11 2.27766 17.62L6.09766 15.01Z" fill="#FBBC05"/>
                  <path d="M12.0077 6.27993C13.5677 6.27993 14.9377 6.83993 15.7977 7.65993L19.5877 3.86993C17.9377 2.34993 15.2477 1.00993 12.0077 1.00993C7.64773 1.00993 3.83773 3.25993 2.27773 6.38993L6.09773 8.99993C6.96773 6.48993 9.28773 4.67993 12.0077 4.67993V6.27993Z" fill="#EA4335"/>
                </svg>
                <span className="signin-social-button-text">Continue with Google</span>
              </button>
              <button 
                type="button" 
                className="signin-social-button"
                onClick={handleFacebookSignIn}
              >
                <svg className="signin-social-icon" viewBox="0 0 24 24">
                  <path d="M22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 16.99 5.82 21.128 10.5 21.856V14.89H7.5V12H10.5V9.67C10.5 6.7 12.284 5 14.921 5C16.207 5 17.27 5.102 17.5 5.143V7.619H16.124C14.706 7.619 14.25 8.444 14.25 9.385V12H17.219L16.711 14.89H14.25V21.856C19.18 21.128 22 16.99 22 12Z" fill="#1877F2"/>
                </svg>
                <span className="signin-social-button-text">Continue with Facebook</span>
              </button>
            </div>

            <div className="signin-signup-link">
              <p>
                New to Sankalpam?{' '}
                <Link to="/signup" className="signin-link-primary">Sign Up</Link>
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
