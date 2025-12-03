import React, { createContext, useState, useEffect, useContext } from 'react';

const EcomContext = createContext();

export const EcomProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

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

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = wishlist.length;

  return (
    <EcomContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        toggleWishlist,
      }}
    >
      {children}
    </EcomContext.Provider>
  );
};

export const useEcom = () => {
  const context = useContext(EcomContext);
  if (!context) {
    throw new Error('useEcom must be used within an EcomProvider');
  }
  return context;
};

export default EcomContext;
