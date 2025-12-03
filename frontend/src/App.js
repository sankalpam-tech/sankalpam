import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EcomProvider } from './context/EcomContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Pujas from './pages/Pujas';
import Astrology from './pages/Astrology';
import Ecommerce from './pages/Ecommerce';
import Tourism from './pages/Tourism';
import './App.css';
import './pages/Ecommerce.css';

function App() {
  return (
    <Router>
      <EcomProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pujas" element={<Pujas />} />
              <Route path="/astrology" element={<Astrology />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/tourism" element={<Tourism />} />
            </Routes>
          </main>
        </div>
      </EcomProvider>
    </Router>
  );
}

export default App;
