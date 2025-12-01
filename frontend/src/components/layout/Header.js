import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/pujas">Pujas</Link>
      <Link to="/astrology">Astrology</Link>
      <Link to="/ecommerce">E-commerce</Link>
      <Link to="/tourism">Tourism</Link>
    </nav>
  );
};

export default Header;
