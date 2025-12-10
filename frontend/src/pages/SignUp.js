import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    referralCode: ''
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
    // Handle sign up logic here
    console.log('Sign up:', formData);
    
    // Simulate successful signup (replace with actual API call)
    const userData = {
      name: formData.fullName || 'User',
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

  const handleGoogleSignUp = () => {
    alert('Google Sign Up will be integrated');
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#FFF8E1', minHeight: '100vh' }}>
      <Navbar activePage="signup" />
      
      <div className="signup-container">
        {/* Left side - decorative image (hidden on mobile) */}
        <div className="signup-left-panel">
          <div className="signup-bg-overlay"></div>
          <div 
            className="signup-bg-image"
            style={{
              backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCYdnpponGgNkdhEr7mFeK77GPEiB_PH5jGIYBiaEzwE463R3FGDlcJy5X1R5OhHqePEbe4ADc9SmrE8svcpX0FwSRigDej8dxQk65O3OOTz_KvTaGtMwSQloJhk9eaqYda9NsdESk5skhiuNXt4gZCII1a51X7WO5yEkSMBhFEmeySEDdKJWPwhI2168WsxBmjQIQXCcv9qhGEHDRpxICj6L8OnQ1nk8d3v8QQ2RbZOo6fIkgVcdh-zQJ4L8JM-sd5-6dZaZ1m-yE)'
            }}
          ></div>
        </div>

        {/* Right side - sign up form */}
        <div className="signup-right-panel">
          <div className="signup-form-container">
            <div className="signup-header-text">
              <h2 className="signup-title">Create Your Sankalpam Account</h2>
              <p className="signup-subtitle">Join thousands on their spiritual path.</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-group">
                <label className="signup-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label className="signup-label">Email or Phone Number</label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="Enter your email or phone number"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label className="signup-label">Password</label>
                <div className="signup-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="signup-input"
                    placeholder="Create a password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="signup-form-group">
                <label className="signup-label">Referral Code (Optional)</label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="Enter referral code"
                />
              </div>

              <button type="submit" className="signup-button-primary">
                Create Account
              </button>
            </form>

            <div className="signup-divider">
              <span>OR</span>
            </div>

            <button 
              type="button" 
              className="signup-google-button"
              onClick={handleGoogleSignUp}
            >
              <svg className="signup-google-icon" viewBox="0 0 48 48">
                <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
                <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
                <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
                <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.24,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="signup-terms">
              <p>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="signup-terms-link">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="signup-terms-link">Privacy Policy</Link>.
              </p>
            </div>

            <div className="signup-signin-link">
              <p>
                Already have an account?{' '}
                <Link to="/signin" className="signup-link-primary">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
