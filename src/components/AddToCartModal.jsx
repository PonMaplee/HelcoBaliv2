import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInRight } from '../lib/animations';
import { useCart } from '../context/CartContext';

export default function AddToCartModal({ isOpen, onClose, product }) {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  // Auto close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 right-4 z-50 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 w-[400px] font-sans"
        >
          {/* Header Area */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-amber-500 w-6 h-6" />
              <span className="font-medium text-white text-lg">Added to Cart</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Product Details Area */}
          <div className="flex gap-4 mb-6">
            <img
              src={product?.image || '/placeholder.jpg'}
              alt={product?.title || 'Product Image'}
              className="w-24 h-24 object-cover bg-white/5 rounded-md shrink-0 border border-white/5"
            />
            <div className="flex flex-col">
              <h3 className="text-white font-medium leading-tight">
                {product?.title || 'Helco Bali Cold Brew'}
              </h3>
              <p className="text-stone-400 text-sm mt-1">
                {product?.category || "Signature Artisan Coffee"}
              </p>
              <p className="text-stone-500 text-sm">
                {product?.size || '1 Pack'}
              </p>
              <p className="text-white font-medium mt-1">
                {product?.price || 'Rp 45.000'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoToCart}
              className="w-full rounded-full bg-transparent border border-amber-500/40 text-amber-500 font-bold py-3.5 hover:bg-amber-500/10 transition-colors uppercase tracking-widest text-xs cursor-pointer"
            >
              View Cart ({totalCount})
            </button>
            <button
              type="button"
              onClick={handleGoToCart}
              className="w-full rounded-full bg-amber-500 text-black font-bold py-3.5 hover:bg-amber-600 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)] uppercase tracking-widest text-xs cursor-pointer"
            >
              Checkout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
