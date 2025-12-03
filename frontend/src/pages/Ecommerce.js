import React, { useMemo, useState, useEffect } from "react";
import "../styles/Ecommerce.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

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
        <Navbar activePage="ecommerce" />
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
        <Navbar activePage="ecommerce" />
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
        <Navbar activePage="ecommerce" />
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
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#FFF8E1', minHeight: '100vh' }}>
        <Navbar activePage="ecommerce" />
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
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#FFF8E1', minHeight: '100vh' }}>
      {/* Top navigation / header */}
      <Navbar activePage="ecommerce" />
      
      {/* Additional ecommerce-specific controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 48px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          padding: '8px 16px',
          gap: '8px',
          minWidth: '250px'
        }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search for puja items..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '14px',
              width: '100%'
            }}
          />
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            position: 'relative'
          }}
          aria-label="Wishlist"
          onClick={() => {}}
        >
          ❤️
          {wishlist.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#c41e3a',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>{wishlist.length}</span>
          )}
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            position: 'relative'
          }}
          aria-label="Cart"
          onClick={() => {
            setIsCartOpen(true);
            setCurrentView("cart");
          }}
        >
          🛒
          {getCartItemCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#c41e3a',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>{getCartItemCount()}</span>
          )}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO SECTION */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '60px 40px',
          marginBottom: '60px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#000'
          }}>Puja Samagri &amp; Spiritual Items</h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '32px'
          }}>
            Discover authentic items for your spiritual journey and daily rituals.
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeCategory === category ? '#c41e3a' : '#fff',
                  color: activeCategory === category ? '#fff' : '#333',
                  border: `2px solid ${activeCategory === category ? '#c41e3a' : '#e0e0e0'}`,
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR + PRODUCTS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '40px',
          marginBottom: '80px'
        }}>
          {/* LEFT SIDEBAR - FILTERS */}
          <aside>
            {/* Categories Filter */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#000'
              }}>Categories</h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {CATEGORY_FILTERS.map((category) => (
                  <li key={category} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        backgroundColor: activeCategory === category ? '#ffebee' : 'transparent',
                        color: activeCategory === category ? '#c41e3a' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: activeCategory === category ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#000'
              }}>Filter by Price</h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>{formatCurrency(100)}</span>
                  <span>{formatCurrency(5000)}+</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={maxPrice}
                  onChange={handlePriceChange}
                  style={{
                    width: '100%',
                    accentColor: '#c41e3a'
                  }}
                />
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '8px'
                }}>
                  Up to <strong style={{ color: '#c41e3a' }}>{formatCurrency(maxPrice)}</strong>
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE - PRODUCTS */}
          <section>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#000'
              }}>Our Products</h2>
              <p style={{
                fontSize: '16px',
                color: '#666'
              }}>
                {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              {paginatedProducts.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px'
                }}>
                  <p style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>No items match your filters.</p>
                  <button
                    onClick={() => {
                      setActiveCategory("All Items");
                      setMaxPrice(5000);
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#c41e3a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                paginatedProducts.map((product) => (
                  <div key={product.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%',
                    height: '250px',
                    backgroundColor: '#4a6560',
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => toggleWishlist(product)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label="Add to wishlist"
                    >
                      {isInWishlist(product.id) ? "❤️" : "🤍"}
                    </button>
                    {addedToCartProductId === product.id && (
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Added to Cart! ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#000'
                    }}>{product.name}</h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#999',
                      marginBottom: '16px'
                    }}>{product.category}</p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#c41e3a'
                      }}>{formatCurrency(product.price)}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => addToCart(product)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            color: '#c41e3a',
                            border: '2px solid #c41e3a',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleBuyNow(product)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#c41e3a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {paginatedProducts.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '48px'
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                  color: currentPage === 1 ? '#999' : '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: page === currentPage ? '#c41e3a' : '#fff',
                      color: page === currentPage ? '#fff' : '#333',
                      border: `1px solid ${page === currentPage ? '#c41e3a' : '#e0e0e0'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  color: currentPage === totalPages ? '#999' : '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </section>
        </div>
      </main>

      <Footer />

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
