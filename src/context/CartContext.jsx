import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

/**
 * [TAG: HELPER_PARSE_PRICE]
 * Mengubah string format harga (seperti "Rp 120.000") menjadi angka murni (120000).
 * Berguna untuk perhitungan subtotal di dalam fungsi keranjang.
 */
export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d]/g, '');
  return Number.parseInt(cleaned, 10) || 0;
};

/**
 * [TAG: HELPER_FORMAT_IDR]
 * Mengubah angka murni menjadi format mata uang Rupiah standar (Rp).
 */
export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

/**
 * [TAG: CART_PROVIDER]
 * Provider utama yang mengontrol seluruh status (state) keranjang di frontend
 * dan menghubungkannya dengan backend Laravel (API).
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  // Hardcoded session ID untuk user tanpa login (Guest)
  const sessionId = 'guest_123'; 

  /**
   * [TAG: FETCH_CART]
   * Mengambil data keranjang dari backend dan memetakan struktur JSON
   * agar sesuai dengan kebutuhan tampilan frontend.
   */
  const fetchCart = () => {
    fetch(`/api/cart?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => {
          const product = item.product || {};
          return {
            id: item.id || item._id, // ID keranjang (Cart Item ID)
            productId: product.id || product._id, // ID Produk (Product ID)
            name: product.title,
            category: product.processing,
            price: product.price,
            quantity: item.quantity,
            image: product.image,
            roast: product.roast
          };
        });
        setCart(mapped);
      })
      .catch(console.error);
  };

  // Otomatis fetch data keranjang saat web pertama kali dimuat
  useEffect(() => {
    fetchCart();
  }, []);

  /**
   * [TAG: ADD_TO_CART]
   * Mengirim request POST ke backend untuk menambahkan produk ke database keranjang.
   * Setelah sukses, otomatis memanggil fetchCart() untuk menyinkronkan data.
   */
  const addToCart = (product, quantity = 1) => {
    const payload = {
      product_id: product._id || product.id,
      quantity,
      session_id: sessionId
    };
    
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(() => fetchCart())
    .catch(console.error);
  };

  /**
   * [TAG: REMOVE_ITEM]
   * Mengirim request DELETE ke backend untuk menghapus satu produk dari keranjang.
   */
  const removeItem = (id) => {
    fetch(`/api/cart/${id}`, { method: 'DELETE' })
      .then(() => fetchCart())
      .catch(console.error);
  };

  /**
   * [TAG: UPDATE_QUANTITY]
   * Mengubah jumlah barang secara lokal di frontend (optimistic update).
   * Jika jumlahnya 0, maka item akan dihapus dari database.
   */
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

  /**
   * [TAG: CLEAR_CART]
   * Mengosongkan seluruh keranjang user di backend dan me-reset state lokal.
   * Dipanggil saat user berhasil melakukan checkout.
   */
  const clearCart = () => {
    fetch(`/api/cart?session_id=${sessionId}`, { method: 'DELETE' })
      .then(() => setCart([]))
      .catch(console.error);
  };

  // Kalkulasi total harga dan pajak
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0);
  const deliveryFee = 0;
  const taxRate = 0.11;
  const estimatedTaxes = subtotal * taxRate;
  const total = subtotal + deliveryFee + estimatedTaxes;

  return (
    <CartContext.Provider value={{
      cart, addToCart, updateQuantity, removeItem, clearCart,
      totalCount, subtotal, deliveryFee, estimatedTaxes, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * [TAG: USE_CART_HOOK]
 * Custom hook untuk memudahkan pemanggilan fungsi keranjang di komponen lain.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
