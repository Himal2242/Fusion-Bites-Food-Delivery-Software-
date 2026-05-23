import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on initial render
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add to cart: product = { productId, name, price, image, restaurantName, ... }
  // quantity = number, addOns = array of { name, price }
  const addToCart = (product, quantity = 1, addOns = []) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.productId &&
          JSON.stringify(item.addOns) === JSON.stringify(addOns)
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity, addOns }];
    });
  };

  const updateQuantity = (productId, newQuantity, addOns = []) => {
    setCartItems(prev => prev.map(item =>
      item.productId === productId && JSON.stringify(item.addOns) === JSON.stringify(addOns)
        ? { ...item, quantity: Math.max(0, newQuantity) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId, addOns = []) => {
    setCartItems(prev => prev.filter(item =>
      !(item.productId === productId && JSON.stringify(item.addOns) === JSON.stringify(addOns))
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};