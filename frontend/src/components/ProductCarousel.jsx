import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

/**
 * [TAG: COMPONENT_PRODUCT_CAROUSEL]
 * Komponen carousel (slider) yang menampilkan produk andalan di halaman Home.
 * Mengambil datanya secara langsung dari API backend.
 */
export default function ProductCarousel() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  /**
   * [TAG: FETCH_FEATURED_PRODUCTS]
   * Mengambil data produk dari backend Laravel saat komponen dimuat pertama kali.
   */
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/products', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Produk tidak tersedia');
        return response.json();
      })
      .then((products) => {
        if (!Array.isArray(products)) throw new Error('Format produk tidak dikenal');
        setFeaturedProducts(products.filter((item) => item?.processing !== 'Merchandise' && item?.roast !== 'Accessory'));
        setStatus('ready');
      })
      .catch((error) => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, []);

  return (
    <section className="w-full bg-white py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#111111] uppercase tracking-tighter">
            Featured Roasts
          </h2>
          <Link to="/explore" className="inline-flex min-h-11 items-center gap-2 text-slate-900 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Explore collection <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>

        {/* Carousel / Grid Container */}
        {status === 'loading' ? <p role="status" className="py-16 text-slate-700">Loading featured products...</p> : status === 'error' ? <p role="alert" className="py-16 text-slate-700">Featured products are unavailable right now. Browse the collection on Explore.</p> : featuredProducts.length === 0 ? <p role="status" className="py-16 text-slate-700">No featured products available. Browse the collection on Explore.</p> : <div className="relative">
          {/* Scrollable container: 4 cols on desktop, 2 cols on mobile */}
          <div
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
          
        </div>}
        
      </div>

    </section>
  );
}
