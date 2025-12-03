import React, { useMemo, useState, useEffect } from "react";
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState("products"); // products, cart, buyingForm, payment, confirmation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [addedToCartProductId, setAddedToCartProductId] = useState(null);

  const ITEMS_PER_PAGE = 8;

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("sankalpam_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
    const savedWishlist = localStorage.getItem("sankalpam_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error loading wishlist:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem("sankalpam_cart")) {
      localStorage.setItem("sankalpam_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlist.length > 0 || localStorage.getItem("sankalpam_wishlist")) {
      localStorage.setItem("sankalpam_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

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

  // Cart functions
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // Show inline notification
    setAddedToCartProductId(product.id);
    setTimeout(() => {
      setAddedToCartProductId(null);
    }, 2000);
  };

  // Wishlist functions
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some((item) => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Buy Now - direct purchase
  const handleBuyNow = (product) => {
    setCart([{ ...product, quantity: 1 }]);
    setCurrentView("buyingForm");
    setIsCartOpen(false);
  };

  // Form handling
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setCurrentView("payment");
  };

  // Payment handling
  const handlePayment = () => {
    // Simulate payment processing
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total: getCartTotal(),
      customer: formData,
      date: new Date().toISOString(),
    };
    setOrderDetails(order);
    
    // Simulate WhatsApp notification
    const whatsappMessage = `Order Confirmed!\n\nOrder ID: ${order.id}\nTotal: ${formatCurrency(order.total)}\n\nItems:\n${cart.map(item => `- ${item.name} x${item.quantity}`).join('\n')}\n\nThank you for your purchase!`;
    console.log("WhatsApp notification (simulated):", whatsappMessage);
    
    // In real app, this would send to backend which sends WhatsApp
    // For now, we'll show an alert
    alert(`Order Confirmed!\n\nOrder ID: ${order.id}\n\nWhatsApp confirmation sent (simulated).\n\nIn production, this would be sent via WhatsApp API.`);
    
    // Clear cart
    setCart([]);
    localStorage.removeItem("sankalpam_cart");
    
    setCurrentView("confirmation");
  };

  // Navigation functions
  const goToProducts = () => {
    setCurrentView("products");
    setIsCartOpen(false);
  };

  const goToCart = () => {
    setCurrentView("cart");
    setIsCartOpen(false);
  };

  // Render different views
  if (currentView === "buyingForm") {
    return (
      <div className="ecom-page">
        <header className="ecom-header">
          <div className="ecom-header-left">
            <div className="ecom-logo">
              <span className="ecom-logo-icon">🪔</span>
              <span className="ecom-logo-text">Sankalpam</span>
            </div>
          </div>
          <button className="ecom-back-btn" onClick={goToProducts}>
            ← Back to Products
          </button>
        </header>
        <div className="ecom-form-container">
          <h1>Buying Information</h1>
          <form onSubmit={handleFormSubmit} className="ecom-buying-form">
            <div className="ecom-form-row">
              <div className="ecom-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="ecom-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className="ecom-form-row">
              <div className="ecom-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className="ecom-form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                rows="3"
                required
              />
            </div>
            <div className="ecom-form-row">
              <div className="ecom-form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="ecom-form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="ecom-form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className="ecom-order-summary">
              <h3>Order Summary</h3>
              {cart.map((item) => (
                <div key={item.id} className="ecom-order-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="ecom-order-total">
                <strong>Total: {formatCurrency(getCartTotal())}</strong>
              </div>
            </div>
            <button type="submit" className="ecom-primary-btn ecom-pay-btn">
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentView === "payment") {
    return (
      <div className="ecom-page">
        <header className="ecom-header">
          <div className="ecom-header-left">
            <div className="ecom-logo">
              <span className="ecom-logo-icon">🪔</span>
              <span className="ecom-logo-text">Sankalpam</span>
            </div>
          </div>
        </header>
        <div className="ecom-payment-container">
          <h1>Payment</h1>
          <div className="ecom-payment-card">
            <div className="ecom-payment-summary">
              <h3>Order Summary</h3>
              {cart.map((item) => (
                <div key={item.id} className="ecom-payment-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="ecom-payment-total">
                <strong>Total Amount: {formatCurrency(getCartTotal())}</strong>
              </div>
            </div>
            <div className="ecom-payment-methods">
              <h3>Select Payment Method</h3>
              <div className="ecom-payment-options">
                <label className="ecom-payment-option">
                  <input type="radio" name="payment" value="upi" defaultChecked />
                  <span>UPI</span>
                </label>
                <label className="ecom-payment-option">
                  <input type="radio" name="payment" value="card" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="ecom-payment-option">
                  <input type="radio" name="payment" value="cod" />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
            <button
              className="ecom-primary-btn ecom-pay-now-btn"
              onClick={handlePayment}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "confirmation") {
    return (
      <div className="ecom-page">
        <header className="ecom-header">
          <div className="ecom-header-left">
            <div className="ecom-logo">
              <span className="ecom-logo-icon">🪔</span>
              <span className="ecom-logo-text">Sankalpam</span>
            </div>
          </div>
        </header>
        <div className="ecom-confirmation-container">
          <div className="ecom-confirmation-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p className="ecom-confirmation-message">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          {orderDetails && (
            <div className="ecom-order-details-card">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> {orderDetails.id}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(orderDetails.total)}</p>
              <p><strong>Date:</strong> {new Date(orderDetails.date).toLocaleString()}</p>
              <div className="ecom-confirmation-items">
                <h4>Items:</h4>
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="ecom-confirmation-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="ecom-confirmation-address">
                <h4>Delivery Address:</h4>
                <p>{orderDetails.customer.name}</p>
                <p>{orderDetails.customer.address}</p>
                <p>
                  {orderDetails.customer.city}, {orderDetails.customer.state} - {orderDetails.customer.pincode}
                </p>
                <p>Phone: {orderDetails.customer.phone}</p>
              </div>
              <div className="ecom-whatsapp-notice">
                <p>📱 Order confirmation sent via WhatsApp (simulated)</p>
                <p className="ecom-notice-small">
                  In production, this would be sent to both you and our admin via WhatsApp API.
                </p>
              </div>
            </div>
          )}
          <button className="ecom-primary-btn" onClick={goToProducts}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (currentView === "cart") {
    return (
      <div className="ecom-page">
        <header className="ecom-header">
          <div className="ecom-header-left">
            <div className="ecom-logo">
              <span className="ecom-logo-icon">🪔</span>
              <span className="ecom-logo-text">Sankalpam</span>
            </div>
          </div>
          <button className="ecom-back-btn" onClick={goToProducts}>
            ← Back to Products
          </button>
        </header>
        <div className="ecom-cart-container">
          <h1>Shopping Cart</h1>
          {cart.length === 0 ? (
            <div className="ecom-empty-cart">
              <p>Your cart is empty</p>
              <button className="ecom-primary-btn" onClick={goToProducts}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="ecom-cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="ecom-cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="ecom-cart-item-details">
                      <h3>{item.name}</h3>
                      <p className="ecom-cart-item-category">{item.category}</p>
                      <div className="ecom-cart-item-controls">
                        <div className="ecom-quantity-controls">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="ecom-cart-item-price">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                      <button
                        className="ecom-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ecom-cart-summary">
                <div className="ecom-cart-total">
                  <h3>Total: {formatCurrency(getCartTotal())}</h3>
                </div>
                <button
                  className="ecom-primary-btn ecom-checkout-btn"
                  onClick={() => {
                    setCurrentView("buyingForm");
                  }}
                >
                  Buy Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

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
          <button
            className="ecom-icon-btn ecom-wishlist-btn"
            aria-label="Wishlist"
            onClick={() => {
              // Could add wishlist view here later
            }}
          >
            ❤️
            {wishlist.length > 0 && (
              <span className="ecom-wishlist-badge">{wishlist.length}</span>
            )}
          </button>
          <button
            className="ecom-icon-btn ecom-cart-btn"
            aria-label="Cart"
            onClick={() => {
              setIsCartOpen(true);
              setCurrentView("cart");
            }}
          >
            🛒
            {getCartItemCount() > 0 && (
              <span className="ecom-cart-badge">{getCartItemCount()}</span>
            )}
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
                      className={`ecom-fav-btn ${isInWishlist(product.id) ? "ecom-fav-btn-active" : ""}`}
                      aria-label="Add to wishlist"
                      onClick={() => toggleWishlist(product)}
                    >
                      {isInWishlist(product.id) ? "❤️" : "🤍"}
                    </button>
                    {addedToCartProductId === product.id && (
                      <div className="ecom-added-notification">
                        Added to Cart! ✓
                      </div>
                    )}
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
                      <div className="ecom-product-actions">
                        <button
                          className="ecom-add-btn"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="ecom-buy-btn"
                          onClick={() => handleBuyNow(product)}
                        >
                          Buy Now
                        </button>
                      </div>
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

      {/* Cart Sidebar Modal */}
      {isCartOpen && currentView === "products" && (
        <>
          <div
            className="ecom-cart-overlay"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="ecom-cart-sidebar">
            <div className="ecom-cart-sidebar-header">
              <h2>Cart ({getCartItemCount()})</h2>
              <button
                className="ecom-close-btn"
                onClick={() => setIsCartOpen(false)}
              >
                ×
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="ecom-cart-sidebar-empty">
                <p>Your cart is empty</p>
                <button
                  className="ecom-primary-btn"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="ecom-cart-sidebar-items">
                  {cart.map((item) => (
                    <div key={item.id} className="ecom-cart-sidebar-item">
                      <img src={item.image} alt={item.name} />
                      <div className="ecom-cart-sidebar-item-info">
                        <h4>{item.name}</h4>
                        <div className="ecom-cart-sidebar-item-controls">
                          <div className="ecom-quantity-controls-small">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <span className="ecom-cart-sidebar-item-price">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="ecom-remove-btn-small"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="ecom-cart-sidebar-footer">
                  <div className="ecom-cart-sidebar-total">
                    <strong>Total: {formatCurrency(getCartTotal())}</strong>
                  </div>
                  <button
                    className="ecom-primary-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      goToCart();
                    }}
                  >
                    View Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Ecommerce;
