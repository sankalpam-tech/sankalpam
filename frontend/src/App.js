import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';

import Pujas from './pages/Pujas';
import Astrology from './pages/Astrology';
import Ecommerce from './pages/Ecommerce';
import Tourism from './pages/Tourism';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import Admin from './pages/Admin';
import FloatingButtons from './components/FloatingButtons';
import ForgotMail from "./pages/ForgotMail";
import Otp from "./pages/Otp";
import ResetPass from "./pages/ResetPass";
import OAuthSuccess from "./pages/OAuthSuccess";

import './App.css';

// Import background images for preloading
import bgPujas from './images/86-Meenakshi-Amman-Temple-01_credit-Shutterstock.jpg';
import bgAstrology from './images/astrology.jpg';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Preload background images on app mount
  useEffect(() => {
    const imagesToPreload = [bgPujas, bgAstrology];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pujas" element={<Pujas />} />
              <Route path="/astrology" element={<Astrology />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/tourism" element={<Tourism />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot" element={<ForgotMail />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/otp" element={<Otp />} />
              <Route path="/reset" element={<ResetPass />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <FloatingButtons />
        </div>
      </Router>
    </AuthProvider>
  );
}
// test deploy testing////
export default App;
