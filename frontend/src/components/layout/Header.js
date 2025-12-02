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
