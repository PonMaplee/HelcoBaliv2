import { createContext, useContext, useState, useEffect } from 'react';
import { cartItems as defaultCartItems } from '../data/cartItems';

const CartContext = createContext(null);

const STORAGE_KEY = 'helcobali_cart';

export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d]/g, '');
  return Number.parseInt(cleaned, 10) || 0;
};

export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return defaultCartItems;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const numericPrice = parsePrice(product.price);
    const title = product.title || product.name || 'Helco Bali Cold Brew';
    const image = product.image || (product.gallery && product.gallery[0]) || '/placeholder.jpg';
    const category = product.processing || product.category || 'Artisan Cold Brew';
    const size = product.size || `${quantity} Pack${quantity > 1 ? 's' : ''}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          id: product.id,
          name: title,
          category,
          color: product.roast || product.notes || 'Signature Roast',
          size,
          price: numericPrice,
          quantity,
          image,
        },
      ];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * (item.quantity || 1),
    0,
  );
  const deliveryFee = 0; // Free artisan delivery
  const taxRate = 0.11;
  const estimatedTaxes = subtotal * taxRate;
  const total = subtotal + deliveryFee + estimatedTaxes;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        subtotal,
        deliveryFee,
        estimatedTaxes,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
