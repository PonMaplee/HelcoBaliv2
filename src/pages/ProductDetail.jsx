import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ExternalLink } from 'lucide-react';
import { products } from '../data/products';
import AddToCartModal from '../components/AddToCartModal';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, totalCount } = useCart();
  const productId = Number.parseInt(id, 10);
  const product = products.find((item) => item.id === productId) || products[0];

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images = product.gallery || [product.image];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsModalOpen(true);
  };

  return (
    <section className="w-full bg-[#050505] min-h-screen flex items-center justify-center p-4 md:p-12 lg:p-24 font-sans text-stone-300 pt-28">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        
        {/* ==============================================================
            LEFT COLUMN (Image Gallery)
            ============================================================== */}
        <div className="relative flex flex-col items-center justify-center bg-transparent aspect-[4/5] md:aspect-square group min-w-0">
          
          {/* Main Image Container */}
          <div className="w-full h-full flex items-center justify-center bg-[#080808] border border-white/5 shadow-2xl p-12">
            <img 
              src={images[currentImageIndex]} 
              alt={product.title} 
              className="object-contain w-full h-full transition-transform duration-700 hover:scale-105"
            />
          </div>

          {images.length > 1 && (
            <button 
              type="button"
              onClick={handleNextImage}
              className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg hover:scale-110 hover:border-amber-500 hover:text-amber-500 transition-all z-10 opacity-100 md:opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ArrowRight size={20} className="text-white hover:text-amber-500 transition-colors" />
            </button>
          )}

          {/* Text-based Pagination (01 02 03) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-6 text-sm tracking-[0.2em] z-10">
              {images.map((_, idx) => (
                <span 
                  key={idx} 
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`cursor-pointer transition-colors duration-300 ${
                    currentImageIndex === idx ? 'font-bold text-white' : 'text-stone-600 hover:text-stone-400'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ==============================================================
            RIGHT COLUMN (Product Details)
            ============================================================== */}
        <div className="flex flex-col justify-center py-4 md:py-8 lg:pr-8 min-w-0">
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-wider leading-[1.15] mb-4 text-white">
            {product.title}
          </h1>
          
          {/* Tasting Notes */}
          <p className="text-base md:text-lg font-medium text-stone-400 mb-8 md:mb-12">
            {product.notes}
          </p>

          {/* Specifications */}
          <div className="space-y-6 mb-8 md:mb-12">
            {/* Processing */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-stone-500 mb-1">
                Processing
              </p>
              <p className="font-semibold text-sm tracking-wide text-stone-200">
                {product.processing}
              </p>
            </div>

            {/* Roast Indicator */}
            {product.roastValue !== "0%" && (
              <div>
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-stone-300 mb-3">
                  {product.roast}
                </p>
                <div className="w-full h-1 bg-white/10 rounded-none overflow-hidden relative">
                  {/* Progress Bar layering (Left side) */}
                  <div 
                    className="absolute left-0 top-0 h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                    style={{ width: product.roastValue }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Description Paragraph */}
          <p className="text-sm leading-relaxed text-stone-400 mb-12">
            {product.description}
          </p>

          {/* Action Area (Bottom Flex Row) */}
          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-white/10 bg-transparent px-2 h-14 w-full sm:w-32 shrink-0 text-white">
                <button 
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="text-stone-500 hover:text-amber-500 p-3 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-sm select-none">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="text-stone-500 hover:text-amber-500 p-3 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 border border-amber-500/40 bg-transparent text-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.15)] h-14 font-bold uppercase tracking-[0.15em] text-xs hover:bg-amber-500 hover:text-black hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all duration-300 ease-out flex items-center justify-center cursor-pointer"
              >
                Add to Cart <span className="mx-4 font-normal opacity-60">|</span> {product.price}
              </button>
            </div>
            
            {/* Disclaimer / Extra Link */}
            <a href="#" className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 hover:text-amber-500 uppercase tracking-widest transition-colors mt-4">
              <ExternalLink size={10} strokeWidth={2.5} />
              Read about our sourcing transparency
            </a>
          </div>

        </div>
      </div>
      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={{
          title: product.title,
          image: images[currentImageIndex],
          category: product.processing || "Signature Coffee Blend",
          size: `${quantity} Pack${quantity > 1 ? 's' : ''}`,
          price: product.price,
          cartItemCount: totalCount
        }}
      />
    </section>
  );
}
