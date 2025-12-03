import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pujas from './pages/Pujas';
import Astrology from './pages/Astrology';
import Ecommerce from './pages/Ecommerce';
import Tourism from './pages/Tourism';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

// Import background images for preloading
import bgPujas from './images/86-Meenakshi-Amman-Temple-01_credit-Shutterstock.jpg';
import bgAstrology from './images/astrology.jpg';

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
    <Router>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
