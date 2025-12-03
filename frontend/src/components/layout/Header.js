import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEcom } from '../../context/EcomContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, wishlistCount, toggleWishlist } = useEcom();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/ecommerce?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="ecom-header">
      {/* Left Section */}
      <div className="ecom-header-left">
        <Link to="/" className="ecom-logo">
          <span className="ecom-logo-icon">🪔</span>
          <span className="ecom-logo-text">Sankalpam</span>
        </Link>

        {/* Navigation */}
        <nav className="ecom-nav">
          <Link
            to="/"
            className={`ecom-nav-link ${
              location.pathname === "/" ? "ecom-nav-link-active" : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/pujas"
            className={`ecom-nav-link ${
              location.pathname === "/pujas" ? "ecom-nav-link-active" : ""
            }`}
          >
            Pujas
          </Link>

          <Link
            to="/ecommerce"
            className={`ecom-nav-link ${
              location.pathname === "/ecommerce" ? "ecom-nav-link-active" : ""
            }`}
          >
            Store
          </Link>

          <Link
            to="/astrology"
            className={`ecom-nav-link ${
              location.pathname === "/astrology" ? "ecom-nav-link-active" : ""
            }`}
          >
            Astrology
          </Link>

          <Link
            to="/tourism"
            className={`ecom-nav-link ${
              location.pathname === "/tourism" ? "ecom-nav-link-active" : ""
            }`}
          >
            Tourism
          </Link>
        </nav>
      </div>

      {/* Right Section */}
      <div className="ecom-header-right">
        {/* Search Bar */}
        {/* <form className="ecom-search-wrapper" onSubmit={handleSearch}>
          <span className="ecom-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for puja items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form> */}

        {/* Icons */}
        <div className="ecom-header-icons">
          {/* <button 
            className="ecom-icon-btn ecom-wishlist-btn"
            onClick={() => navigate('/ecommerce?view=wishlist')}
          >
            ❤️
            {wishlistCount > 0 && (
              <span className="ecom-wishlist-badge">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>

          <button 
            className="ecom-icon-btn ecom-cart-btn"
            onClick={() => navigate('/ecommerce?view=cart')}
          >
            🛒
            {cartCount > 0 && (
              <span className="ecom-cart-badge">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button> */}

          <button 
            className="ecom-avatar"
            onClick={() => navigate('/profile')}
            aria-label="User profile"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

// import React from "react";
// import { Link, useLocation } from "react-router-dom";

// const Header = ({ searchTerm, handleSearchChange }) => {
//   const location = useLocation(); // To highlight active links

//   return (
//     <header className="ecom-header">

//       {/* Left Section */}
//       <div className="ecom-header-left">
//         <div className="ecom-logo">
//           <span className="ecom-logo-icon">🪔</span>
//           <span className="ecom-logo-text">Sankalpam</span>
//         </div>

//         {/* Navigation */}
//         <nav className="ecom-nav">

//           <Link
//             to="/"
//             className={`ecom-nav-link ${
//               location.pathname === "/" ? "ecom-nav-link-active" : ""
//             }`}
//           >
//             Home
//           </Link>

//           <Link
//             to="/pujas"
//             className={`ecom-nav-link ${
//               location.pathname === "/pujas" ? "ecom-nav-link-active" : ""
//             }`}
//           >
//             Pujas
//           </Link>

//           <Link
//             to="/store"
//             className={`ecom-nav-link ${
//               location.pathname === "/store" ? "ecom-nav-link-active" : ""
//             }`}
//           >
//             Store
//           </Link>

//           <Link
//             to="/astrology"
//             className={`ecom-nav-link ${
//               location.pathname === "/astrology" ? "ecom-nav-link-active" : ""
//             }`}
//           >
//             Astrology
//           </Link>

//           <Link
//             to="/tourism"
//             className={`ecom-nav-link ${
//               location.pathname === "/tourism" ? "ecom-nav-link-active" : ""
//             }`}
//           >
//             Tourism
//           </Link>

//         </nav>
//       </div>

//       {/* Right Section */}
//       <div className="ecom-header-right">

//         {/* Search Bar */}
//         <div className="ecom-search-wrapper">
//           <span className="ecom-search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search for puja items..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>

//         {/* Icons */}
//         <button className="ecom-icon-btn" aria-label="Wishlist">❤️</button>
//         <button className="ecom-icon-btn" aria-label="Cart">🛒</button>

//         <button className="ecom-avatar" aria-label="Profile">
//           <span>U</span>
//         </button>
//       </div>

//     </header>
//   );
// };

// export default Header;
