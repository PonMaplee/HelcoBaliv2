import { useRef, useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';

const SCROLL_DISTANCE = 300;

/**
 * [TAG: COMPONENT_PRODUCT_CAROUSEL]
 * Komponen carousel (slider) yang menampilkan produk andalan di halaman Home.
 * Mengambil datanya secara langsung dari API backend.
 */
export default function ProductCarousel() {
  const scrollRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  /**
   * [TAG: FETCH_FEATURED_PRODUCTS]
   * Mengambil data produk dari backend Laravel saat komponen dimuat pertama kali.
   */
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data))
      .catch(console.error);
  }, []);

  /**
   * [TAG: HANDLER_SCROLL_CAROUSEL]
   * Membantu geser scroll kiri/kanan pada UI Carousel saat tombol ditekan.
   */
  const scrollProducts = (distance) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-white py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#111111] uppercase tracking-tighter">
            Featured Roasts
          </h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => scrollProducts(-SCROLL_DISTANCE)}
              className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
              aria-label="Scroll products left"
            >
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => scrollProducts(SCROLL_DISTANCE)}
              className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
              aria-label="Scroll products right"
            >
              <ArrowRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Carousel / Grid Container */}
        <div className="relative">
          {/* Scrollable container: 4 cols on desktop, 2 cols on mobile */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-6 pb-8"
          >
            {featuredProducts.map((product) => (
              <div 
                key={product.id ?? product._id} 
                className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(25%-1.125rem)] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Faded right edge to imply carousel (Desktop only) */}
          <div className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block z-10"></div>
          
          {/* Right Arrow Overlapping */}
          <div className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1/4 hidden md:flex items-center justify-center z-20">
            <button
              type="button"
              onClick={() => scrollProducts(SCROLL_DISTANCE)}
              className="w-12 h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-slate-900 hover:bg-slate-50 hover:scale-105 transition-all"
              aria-label="Scroll products right"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
      </div>

    </section>
  );
}
