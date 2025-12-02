import React, { useMemo, useState } from "react";
import "./Ecommerce.css";

// Mock product data – frontend only, no backend calls
const PRODUCTS = [
  {
    id: 1,
    name: "Brass Diya Set",
    category: "Puja Kits",
    price: 499,
    image:
      "https://5.imimg.com/data5/SELLER/Default/2023/10/350831350/CR/JZ/JK/32461526/shiv-shakti-arts-brass-puja-plate-diya-set-embossed-design-1-plate-20-brass-diyas-1000x1000.jpg",
  },
  {
    id: 2,
    name: "Marble Ganesh Idol",
    category: "Idols & Murtis",
    price: 1299,
    image:
      "https://m.media-amazon.com/images/I/81NNnlE4lLL.jpg",
  },
  {
    id: 3,
    name: "Bhagavad Gita",
    category: "Spiritual Books",
    price: 799,
    image:
      "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781647226787/bhagavad-gita-9781647226787_hr.jpg",
  },
  {
    id: 4,
    name: "Navaratri Puja Kit",
    category: "Puja Kits",
    price: 2499,
    image:
      "https://images-cdn.ubuy.co.in/67004ed9fed59b7a8146b3db-pujahome-navratri-puja-samagri.jpg",
  },
  {
    id: 5,
    name: "Sandalwood Incense",
    category: "Incense & Dhoop",
    price: 249,
    image:
      "https://hemfragrances.com/cdn/shop/products/SANDALWOODHX_INCENSE.jpg?v=1606552877",
  },
  {
    id: 6,
    name: "Panchmukhi Rudraksha",
    category: "Rudraksha & Malas",
    price: 1999,
    image:
      "https://astroblog.in/wp-content/uploads/2021/02/6.png",
  },
  {
    id: 7,
    name: "Brass Puja Thali",
    category: "Puja Kits",
    price: 899,
    image:
      "https://i.etsystatic.com/26958973/r/il/03f238/2836194859/il_1588xN.2836194859_g3uu.jpg",
  },
  {
    id: 8,
    name: "Silver Plated Kalash",
    category: "Puja Kits",
    price: 1499,
    image:
      "https://i5.walmartimages.com/seo/GoldGiftIdeas-Oxidized-Silver-Plated-Nakshi-Pooja-Kalash-Pooja-Thali-Set-Decorative-Kalash-Lota-Indian-Pooja-Items-for-Home-Wedding-Gift_7d984f9d-fa19-4f74-810f-945dccde3a8a.a7b32f6f434f636188d442586eb958cf.jpeg",
  },
  {
    id: 9,
    name: "Bracelet",
    category: "Rudraksha & Malas",
    price: 1599,
    image:
      "https://i.pinimg.com/originals/0f/aa/a2/0faaa2099662c2847a117cb25f37abbc.jpg",
  },
  
];

const CATEGORY_FILTERS = [
  "All Items",
  "Idols & Murtis",
  "Puja Kits",
  "Spiritual Books",
  "Incense & Dhoop",
  "Rudraksha & Malas",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const Ecommerce = () => {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === "All Items" ||
        product.category === activeCategory;

      const matchesPrice = product.price <= maxPrice;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [activeCategory, maxPrice, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePriceChange = (event) => {
    setMaxPrice(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ecom-page">
      {/* Top navigation / header */}
      <header className="ecom-header">
        <div className="ecom-header-left">
          <div className="ecom-logo">
            <span className="ecom-logo-icon">🪔</span>
            <span className="ecom-logo-text">Sankalpam</span>
          </div>

          <nav className="ecom-nav">
            <button className="ecom-nav-link">Home</button>
            <button className="ecom-nav-link">Pujas</button>
            <button className="ecom-nav-link ecom-nav-link-active">
              Store
            </button>
            <button className="ecom-nav-link">Astrology</button>
            <button className="ecom-nav-link">Tourism</button>
          </nav>
        </div>

        <div className="ecom-header-right">
          <div className="ecom-search-wrapper">
            <span className="ecom-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for puja items..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button className="ecom-icon-btn" aria-label="Wishlist">
            ❤️
          </button>
          <button className="ecom-icon-btn" aria-label="Cart">
            🛒
          </button>
          <button className="ecom-avatar" aria-label="Profile">
            <span>U</span>
          </button>
        </div>
      </header>

      {/* Page title & tabs */}
      <section className="ecom-hero">
        <h1>Puja Samagri &amp; Spiritual Items</h1>
        <p>
          Discover authentic items for your spiritual journey and daily rituals.
        </p>

        <div className="ecom-tabs-row">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              className={`ecom-tab-pill ${
                activeCategory === category ? "ecom-tab-pill-active" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Main layout: sidebar + products grid */}
      <main className="ecom-main">
        <aside className="ecom-sidebar">
          <div className="ecom-card ecom-categories-card">
            <h3>Categories</h3>
            <ul>
              {CATEGORY_FILTERS.map((category) => (
                <li key={category}>
                  <button
                    className={`ecom-category-btn ${
                      activeCategory === category
                        ? "ecom-category-btn-active"
                        : ""
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="ecom-card ecom-price-filter-card">
            <h3>Filter by Price</h3>
            <div className="ecom-price-range">
              <span>{formatCurrency(100)}</span>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={handlePriceChange}
              />
              <span>{formatCurrency(5000)}+</span>
            </div>
            <p className="ecom-price-selected">
              Showing items up to{" "}
              <strong>{formatCurrency(maxPrice)}</strong>
            </p>
          </div>
        </aside>

        <section className="ecom-products-section">
          <div className="ecom-products-header">
            <h2>Products</h2>
            <p>
              {filteredProducts.length} item
              {filteredProducts.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="ecom-products-grid">
            {paginatedProducts.length === 0 ? (
              <div className="ecom-empty-state">
                <p>No items match your filters.</p>
                <button
                  className="ecom-primary-btn"
                  onClick={() => {
                    setActiveCategory("All Items");
                    setMaxPrice(5000);
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <article className="ecom-product-card" key={product.id}>
                  <div className="ecom-product-image-wrap">
                    <img src={product.image} alt={product.name} />
                    <button
                      className="ecom-fav-btn"
                      aria-label="Add to wishlist"
                    >
                      🤍
                    </button>
                  </div>
                  <div className="ecom-product-body">
                    <h3>{product.name}</h3>
                    <p className="ecom-product-category">
                      {product.category}
                    </p>
                    <div className="ecom-product-footer">
                      <span className="ecom-product-price">
                        {formatCurrency(product.price)}
                      </span>
                      <button className="ecom-add-btn">Add to Cart</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Simple pagination */}
          {paginatedProducts.length > 0 && (
            <div className="ecom-pagination">
              <button
                className="ecom-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    className={`ecom-page-btn ${
                      page === currentPage ? "ecom-page-btn-active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="ecom-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Ecommerce;
